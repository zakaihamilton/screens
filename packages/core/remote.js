/* remote component @component */

package.@component = new Proxy({}, {
    get: function (object, property) {
        /* Check if property exists */
        if (Reflect.has(object, property)) {
            return Reflect.get(object, property);
        }
        return function (args) {
            var info = {method:"GET",
                        url:"method/@component." + property + "(" + encodeURIComponent(JSON.stringify(arguments)) + ")"};
            var result = package.core.http.send(info);
            return result;
        };
    }
    });