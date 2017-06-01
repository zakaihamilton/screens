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
                    function component_loaded() {
                        component = Reflect.get(object, property);
                        if(component !== undefined) {
                            component.id = object.id + "." + property;
                        }
                        console.log(package.core.platform + ": Loaded " + object.id + "." + property);
                    };
                    /* Check if component exists */
                    if (Reflect.has(object, property)) {
                        return Reflect.get(object, property);
                    } else {
                        /* Load component */
                        package_name = Reflect.get(object, "id");
                        if (typeof require !== 'undefined') {
                            global.package = package;
                            path = "./" + package_name + "/" + package_name + "_" + property;
                            require(path);
                        } else if(typeof importScripts !== 'undefined') {
                            importScripts("/packages/" + package_name + "/" + package_name + "_" + property + ".js?platform=client");
                        }
                        else {
                            /* browser can only load asyncronously components */
                            var ref = document.getElementsByTagName( "script" )[ 0 ];
                            var script = document.createElement( "script" );
                            script.src = "/packages/" + package_name + "/" + package_name + "_" + property + ".js?platform=browser";
                            script.async = true;
                            ref.parentNode.insertBefore(script, ref);
                            script.onload = component_loaded;
                            Reflect.set(object, property, null);
                            return null;
                        }
                        component_loaded();
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

package.core.platform;
package.core.console;
package.core.remote;
package.core.event;
package.core.message;
package.core.type;
package.core.http;
if(typeof require !== 'undefined') {
    /* server */
    package.core.module;
    package.core.script;
}
else if(typeof importScripts !== 'undefined') {
    /* client */
    package.core.message.send_browser("app.main.browser");
}
else {
    /* browser */
    package.app.main;
}
