/* remote component __component__ */

screens.__component__ = function (me) {
    me.proxy.apply = function (object, thisArg, argumentsList) {
        return function () {
            var args = Array.prototype.slice.call(argumentsList);
            args.unshift("__component__");
            return me.core.message.send___target_platform__.apply(this, args);
        };
    };
    me.proxy.get = function (object, property) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            args.unshift("__component__." + property);
            return me.core.message.send___target_platform__.apply(this, args);
        };
    };
};
