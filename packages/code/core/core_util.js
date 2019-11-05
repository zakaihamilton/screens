/*
 @author Zakai Hamilton
 @component CoreUtil
 */

screens.core.util = function CoreUtil(me, { core, storage, ui }) {
    me.init = async function () {
        if (me.platform === "browser") {
            me.info = await storage.local.db.get(me.id, "info");
        }
    };
    me.ready = function (methods) {
        methods["core.util.setInfo"] = ["user.access.info"];
    };
    me.setInfo = async function (info) {
        me.info = info;
        await storage.local.db.set(me.id, "info", me.info);
    };
    me.removeLast = function (string, separator) {
        var array = string.split(separator);
        array.pop();
        return array.join(separator);
    };
    me.getArgs = function (func) {
        // First match everything inside the function argument parens.
        var args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];

        // Split the arguments string into an array comma delimited.
        return args.split(",").map(function (arg) {
            // Ensure no inline comments are parsed and trim the whitespace.
            return arg.replace(/\/\*.*\*\//, "").trim();
        }).filter(function (arg) {
            // Ensure no undefined values are added.
            return arg;
        });
    };
    me.config = async function (path) {
        var item = await core.json.loadFile("/package.json");
        if (item && path) {
            item = core.json.traverse(item, path).value;
        }
        return item;
    };
    me.isOnline = function () {
        if (me.platform === "server" || me.platform === "service") {
            return true;
        }
        else {
            return core.network.isOnline();
        }
    };
    me.isSecure = function () {
        if (me.platform === "server") {
            return !core.http.localhost;
        }
        else if (me.platform === "browser") {
            return location.protocol === "https:";
        }
    };
    me.map = async function (object, callback, thisArg) {
        var result = [];
        for (var index = 0; index < object.length; index++) {
            result.push(await callback.call(thisArg, object[index], index, object));
        }
        return result;
    };
    me.sleep = async function (time) {
        return new Promise(resolve => setTimeout(resolve, time));
    };
    me.start = function () {
        if (me.platform === "server" || me.platform === "service") {
            const time = process.hrtime();
            return time;
        }
        else {
            return performance.now();
        }
    };
    me.duration = function (start) {
        if (me.platform === "server" || me.platform === "service") {
            const NS_PER_SEC = 1e9;
            const diff = process.hrtime(start);
            return (diff[0] * NS_PER_SEC + diff[1]) / 1000000;
        }
        else {
            const end = performance.now();
            return end - start;
        }
    };
    me.performance = async function (name, callback, min) {
        var start = me.start();
        var result = await callback();
        var duration = me.duration(start);
        if (duration > min) {
            me.log("performance: " + core.string.padNumber(parseInt(duration), 6) + " - " + this.id + " - " + name);
        }
        return result;
    };
    me.condense = function (callback) {
        if (callback.timer) {
            return;
        }
        callback();
        callback.timer = setTimeout(() => {
            callback.timer = null;
        }, 250);
    };
    me.sync = async function () {
        await storage.cache.empty();
    };
    me.remoteUrl = function () {
        let url = "https://www.screensview.com";
        return url;
    };
    me.url = function (appName, args, local) {
        var url = "";
        if (!local) {
            url = me.remoteUrl();
            if (!me.isSecure()) {
                url = "http://localhost:4040";
            }
        }
        if (appName) {
            url += `/${appName}?args=`;
            url += core.string.encode(JSON.stringify(args));
        }
        return url;
    };
    me.copyUrl = function (appName, args, local) {
        var url = me.url(appName, args, local);
        ui.clipboard.copy(url);
    };
    me.random = function () {
        return parseInt(Math.random() * Math.pow(2, 32)).toString(16);
    };
    me.range = function (num, min, max) {
        if (num < min) {
            num = min;
        }
        if (num >= max) {
            num = max;
        }
        return num;
    };
    me.animate = function (callback, fps = 60) {
        if (me.platform !== "browser") {
            return;
        }
        if (!callback) {
            return;
        }
        let then = performance.now();
        const interval = 1000 / fps;
        const tolerance = 0.1;
        var requestId = null;
        var inAnimation = false;

        const animateLoop = async (now) => {
            requestId = requestAnimationFrame(animateLoop);
            const delta = now - then;

            if (inAnimation) {
                return;
            }

            if (delta >= interval - tolerance) {
                then = now - (delta % interval);
                inAnimation = true;
                if (await callback(delta)) {
                    cancelAnimationFrame(requestId);
                }
                inAnimation = false;
            }
        };
        requestId = requestAnimationFrame(animateLoop);
    };
    me.override = function (modulePath, methodName, overrideCallback) {
        var handle = require(modulePath);
        var originalMethod = handle[methodName];
        handle[methodName] = function (...params) {
            var _this = this;
            overrideCallback(() => {
                originalMethod.call(_this, ...params);
            }, params, _this);
        };
        module.exports = handle;
    };
    me.reload = async function () {
        ui.modal.launch("progress", {
            "title": "Restarting"
        });
        let cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
        await core.message.service_worker.unregister();
        location.reload(true);
    };
};
