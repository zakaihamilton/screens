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
                        platform = "browser";
                        if(typeof require !== 'undefined') {
                            platform = "server";
                        }
                        else if(typeof importScripts !== 'undefined') {
                            platform = "client";
                        }
                        if (platform === "server") {
                            path = "./" + package_name + "/" + package_name + "_" + property;
                            require(path);
                        }
                        else if (platform === "client") {
                            importScripts("/packages/" + package_name + "/" + package_name + "_" + property + ".js?platform=client");
                        }
                        else {
                            /* browser can only load asyncronously components */
                            return null;
                        }
                        /* Load component */
                        component = Reflect.get(object, property);
                        component.id = object.id + "." + property;
                        if((!component.platform || component.platform === platform) && component.init) {
                            component.init();
                        }
                        console.log(package.core.platform + ": Loaded " + object.id + "." + property);
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

var include = function(dependencies, callback) {
    var load = function(index) {
        if(index >= dependencies.length) {
            if(callback) {
                callback();
            }
            return;
        }
        var dependency = dependencies[index];
        if(typeof importScripts === 'undefined' && typeof require === 'undefined') {
            console.log("browser: Loading " + dependency);
            var offset = dependency.lastIndexOf(".");
            var component_name = dependency.substring(offset+1);
            var package_name = dependency.substring(0, offset);
            var ref = document.getElementsByTagName( "script" )[ 0 ];
            var script = document.createElement( "script" );
            script.src = "/packages/" + package_name + "/" + package_name + "_" + component_name + ".js?platform=browser";
            script.onload = function() {
                console.log("browser: Loaded " + package_name + "." + component_name);
                component = package[package_name + "." + component_name];
                component.id = package_name + "." + component_name;
                if(component.init) {
                    component.init();
                }
                /* Load next component */
                load(index+1);
            };
            ref.parentNode.insertBefore(script, ref);
        }
        else {
            console.log(package.core.platform + ": Loading " + dependency);
            package[dependency];
            load(index+1);
        }
    }
    load(0);
}

if (typeof require !== 'undefined') {
    global.package = package;
    global.include = include;
}
