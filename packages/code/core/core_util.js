/*
 @author Zakai Hamilton
 @component CoreUtil
 */

screens.core.util = function CoreUtil(me) {
    me.init = function () {
        if (me.platform === "browser") {
            me.core.listener.register(async () => {
                me.isAdmin = await me.user.access.admin();
                me.userId = await me.user.access.userId();
            }, me.core.login.id);
        }
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
        var item = await me.core.json.loadFile("/package.json");
        if (item && path) {
            item = me.core.json.traverse(item, path).value;
        }
        return item;
    };
    me.isSecure = function () {
        if (me.platform === "server") {
            return !me.core.http.localhost;
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
    me.performance = async function (name, callback) {
        var start = me.start();
        await callback();
        var duration = me.duration(start);
        me.log("performance: " + this.id + " - " + name + " took " + duration + " ms");
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
        await me.storage.cache.empty();
    };
    me.copyUrl = function (appName, args, local) {
        var url = "";
        if (!local) {
            "http://www.screensview.com";
            if (!me.core.util.isSecure()) {
                url = "localhost:4040";
            }
        }
        url += `/${appName}?args=`;
        url += me.core.string.encode(JSON.stringify(args));
        me.ui.clipboard.copy(url);
    };
    me.genPair = function () {
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
};
