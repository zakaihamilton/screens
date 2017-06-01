/* remote component @component */

package.@component = new Proxy({}, {
    get: function (object, property) {
        /* Check if property exists */
        if (Reflect.has(object, property)) {
            return Reflect.get(object, property);
        }
        return function () {
            var args = Array.prototype.slice.call(arguments);
            args.unshift("@component." + property);
            return package.core.message.send_@platform.apply(package.core.message, args);
        };
    }
    });