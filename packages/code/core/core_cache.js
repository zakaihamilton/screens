/*
 @author Zakai Hamilton
 @component CoreCache
 */

screens.core.cache = function CoreCache(me) {
    me.init = function() {
        me.cache = {};
    };
    me.use = function(callback, id, method, params) {
        var item = me.cache[id];
        if(item) {
            me.log("using cache for: " + id + " method: " + method);
            callback.apply(this, item);
            return;
        }
        me.log("storing cache for: " + id + " method: " + method);
        function handler() {
            var args = Array.prototype.slice.call(arguments, 0);
            me.cache[id] = args;
            callback.apply(this, args);
        };
        var args = Array.prototype.slice.call(arguments, 3);
        args.unshift(handler);
        args.unshift(method);
        me.core.message.send.apply(this, args);
    };
    me.reset = function(callback, id) {
        delete me.cache[id];
        callback();
    };
};
