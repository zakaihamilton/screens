/* remote component @component */

package.@component = new Proxy({}, {
    get: function (object, property) {
        /* Check if property exists */
        if (Reflect.has(object, property)) {
            return Reflect.get(object, property);
        }
        return function (args) {
            package.core.message.send_@platform(property, arguments)
        };
    }
    });