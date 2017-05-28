/*
 @author Zakai Hamilton
 @component Core
 */

var package = new Proxy({}, {
    get: function (object, property) {
        /* support for access by string with period as delimiter */
        if (property.includes(".")) {
            parts = property.split(".");
            object = package;
            for (part_index = 0; part_index < parts.length; part_index++) {
                object = object[parts[part_index]];
            }
            return object;
        }
        /* Check if package exists */
        if (Reflect.has(object, property)) {
            return Reflect.get(object, property);
        } else {
            /* Create package */
            package_obj = new Proxy({id: property}, {
                get: function (object, property) {
                    /* Check if component exists */
                    if (Reflect.has(object, property)) {
                        return Reflect.get(object, property);
                    } else {
                        /* Load component */
                        package_name = Reflect.get(object, "id");
                        if (typeof require !== 'undefined') {
                            global.package = package;
                            path = "../" + package_name + "/" + package_name + "_" + property;
                            require(path);
                        } else {
                            var request = new XMLHttpRequest();
                            request.open('GET', "packages/" + package_name + "/" + package_name + "_" + property + ".js", false);
                            request.send(null);
                            var element = document.createElement('script');
                            element.type = "text/javascript";
                            element.text = request.responseText;
                            document.getElementsByTagName('head')[0].appendChild(element);
                        }
                        component = Reflect.get(object, property);
                        component.id = object.id + "." + property;
                        console.log("Loaded " + object.id + "." + property);
                        return component;
                    }
                },
                set: function (object, property, value) {
                    Reflect.set(object, property, value);
                }
            });
            Reflect.set(object, property, package_obj);
            return package_obj;
        }
    }
});

package.core.http.init();
package.core.module;
console.log(package.core.platform);
