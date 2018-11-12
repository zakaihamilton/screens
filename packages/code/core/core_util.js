/*
 @author Zakai Hamilton
 @component CoreUtil
 */

screens.core.util = function CoreUtil(me) {
    me.removeLast = function (string, separator) {
        var array = string.split(separator);
        array.pop();
        return array.join(separator);
    };
    me.getArgs = function (func) {
        // First match everything inside the function argument parens.
        var args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];

        // Split the arguments string into an array comma delimited.
        return args.split(',').map(function (arg) {
            // Ensure no inline comments are parsed and trim the whitespace.
            return arg.replace(/\/\*.*\*\//, '').trim();
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
        return location.protocol === 'https:';
    };
    me.restart = function () {
        location.reload(true);
    };
    me.map = async function (object, callback, thisArg) {
        var result = [];
        for (var index = 0; index < object.length; index++) {
            result.push(await callback.call(thisArg, object[index], index, object));
        }
        return result;
    };
    me.sleep = async function (time) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    };
    me.start = function() {
        if (me.platform === "server" || me.platform === "service") {
            const time = process.hrtime();
            return time;
        }
        else {
            return performance.now();
        }
    };
    me.duration = function(start) {
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
    me.performance = async function(name, callback) {
        var start = me.start();
        await callback();
        var duration = me.duration(start);
        me.log("performance: " + this.id + " - " + name + " took " + duration + " ms");
    };
    me.condense = function(callback) {
        if(callback.timer) {
            return;
        }
        callback();
        callback.timer = setTimeout(() => {
            callback.timer = null;
        }, 250);
    };
    me.sync = async function() {
        await me.storage.cache.empty();
    };
    me.formatDuration = function (duration) {
        var sec = parseInt(duration % 60);
        var min = parseInt(duration / 60) % 60;
        var hour = parseInt(duration / (60 * 60)) % 24;
        var days = parseInt(duration / (24 * 60 * 60));
        if (hour < 10) {
            hour = "0" + hour;
        }
        if (min < 10) {
            min = "0" + min;
        }
        if (sec < 10) {
            sec = "0" + sec;
        }
        if (days) {
            return days + " days" + " + " + hour + ":" + min + ":" + sec;
        }
        else {
            return hour + ":" + min + ":" + sec;
        }
    };
};
