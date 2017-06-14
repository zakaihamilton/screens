/* remote component @component */

package.@component = function (me) {
    me.forward = {
        get: function (object, property) {
            return function () {
                var args = Array.prototype.slice.call(arguments);
                args.unshift("@component." + property);
                return me.send_@platform.apply(null, args);
            };
        }
    };
};
