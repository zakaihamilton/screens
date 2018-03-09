/* remote component __component__ */

package.__component__ = function (me) {
    me.get = function (object, property) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            args.unshift("__component__." + property);
            me.core.message.send___platform__.apply(this, args);
        };
    };
};
