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
                if(!object) {
                    throw property + " not found"
                }
            }
            return object;
        }
        /* Check if platform */
        if(property === "platform") {
            var platform = "browser";
            if(typeof require !== 'undefined') {
                platform = "server";
            }
            else if(typeof importScripts !== 'undefined') {
                platform = "client";
            }
            return platform;
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
                        if (package.platform === "server") {
                            path = "./" + package_name + "/" + package_name + "_" + property;
                            require(path);
                        }
                        else if (package.platform === "client") {
                            importScripts("/packages/" + package_name + "/" + package_name + "_" + property + ".js?platform=client");
                        }
                        else {
                            /* browser can only load asyncronously components */
                            return null;
                        }
                        /* Retrieve component function */
                        var component = Reflect.get(object, property);
                        /* Create instance */
                        var instance = {}
                        instance.id = object.id + "." + property;
                        Reflect.set(object, property, instance);
                        component(instance);
                        if((!instance.platform || instance.platform === platform) && instance.init) {
                            instance.init();
                        }
                        console.log(package.platform + ": Loaded " + object.id + "." + property);
                        return instance;
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

var include = function(packages, callback) {
    var load = function(package_index, component_index) {
        var package_keys = Object.keys(packages);
        if(package_index >= package_keys.length) {
            if(callback) {
                callback();
            }
            return;
        }
        var package_name = package_keys[package_index];
        var components = packages[package_name];
        var component_name = components[component_index];
        console.log(package.platform + ": Loading " + package_name + "." + component_name);
        if(typeof importScripts === 'undefined' && typeof require === 'undefined') {
            var ref = document.getElementsByTagName( "script" )[ 0 ];
            var script = document.createElement( "script" );
            script.src = "/packages/" + package_name + "/" + package_name + "_" + component_name + ".js?platform=browser";
            script.onload = function() {
                /* Retrieve component function */
                var component = package[package_name + "." + component_name];
                /* Create instance */
                var instance = {}
                instance.id = package_name + "." + component_name;
                Reflect.set(package[package_name], component_name, instance);
                component(instance);
                if((!instance.platform || instance.platform === package.platform) && instance.init) {
                    instance.init();
                }
                console.log(package.platform + ": Loaded " + instance.id);
                /* Load next component */
                component_index++;
                if(component_index >= components.length) {
                    package_index++;
                    component_index=0;
                }
                load(package_index,component_index);
            };
            ref.parentNode.insertBefore(script, ref);
        }
        else {
            package[package_name + "." + component_name];
            component_index++;
            if(component_index >= components.length) {
                package_index++;
                component_index=0;
            }
            load(package_index,component_index);
        }
    }
    load(0,0);
}

if (typeof require !== 'undefined') {
    global.package = package;
    global.include = include;
}
