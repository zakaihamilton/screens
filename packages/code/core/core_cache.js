/*
 @author Zakai Hamilton
 @component CoreCache
 */

screens.core.cache = function CoreCache(me) {
    me.init = function () {
        me.cache = {};
    };
    me.use = async function (id, method, params) {
        if (this.userId) {
            var result = await me.user.access.isAPIAllowed(method, this.userId);
            if (!result) {
                throw " User " + this.userName + " is not authorised to use method: " + method;
            }
        }
        var item = me.cache[id];
        if (item) {
            me.log("using cache for: " + id + " method: " + method);
            return item;
        }
        me.log("storing cache for: " + id + " method: " + method);
        var args = Array.prototype.slice.call(arguments, 2);
        args.unshift(method);
        item = await me.core.message.send.apply(this, args);
        me.cache[id] = item;
        return item;
    };
    me.reset = function (id) {
        delete me.cache[id];
    };
    me.resetAll = function () {
        me.cache = {}
    }
};
