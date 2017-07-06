/* remote component @component */

package.__component__ = function (me) {
    me.forward = {
        get: function (object, property) {
            return function () {
                var args = Array.prototype.slice.call(arguments);
                args.unshift("__component__." + property);
                return me.send___platform__.apply(null, args);
            };
        }
    };
};
