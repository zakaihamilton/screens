/* remote component __component__ */

screens.__component__ = function (me) {
    me.apply = function (object, thisArg, argumentsList) {
        return function () {
            var args = Array.prototype.slice.call(argumentsList);
            args.unshift("__component__");
            return me.core.message.send___platform__.apply(this, args);
        };
    };
    me.get = function (object, property) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            args.unshift("__component__." + property);
            return me.core.message.send___platform__.apply(this, args);
        };
    };
};
