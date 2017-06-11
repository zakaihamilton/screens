function package_path(object, path) {
    var root = package;
    items = path.split(".");
    /* Check root */
    if (object.component) {
        /* Check if first parameter is a property of the object */
        if (Reflect.has(object, items[0])) {
            root = object;
        }
        /* Check if first parameter is a sibling component */
        else if (Reflect.has(object.package, items[0])) {
            root = object;
        }
    }
    var item = root;
    for (part_index = 0; part_index < items.length; part_index++) {
        item = item[items[part_index]];
        if (!item) {
            throw path + " not found relative to " + root.id;
        }
    }
    return item;
}

function package_platform() {
    var platform = "browser";
    if (typeof require !== 'undefined') {
        platform = "server";
    } else if (typeof importScripts !== 'undefined') {
        platform = "client";
    }
    return platform;
}

function package_init(package_name, component_name) {
    console.log("package_init: " + package_name + "." + component_name);
    /* Retrieve component function */
    var component = Reflect.get(package[package_name], component_name);
    /* Create component proxy */
    var component_obj = new Proxy({id: package_name + "." + component_name, package: package_name, component: component_name}, {
        get: function (object, property) {
            result = package_general(object, property);
            if (result) {
                return result;
            }
            return undefined;
        },
        set: function (object, property, value) {
            Reflect.set(object, property, value);
        }
    });
    Reflect.set(package[package_name], component_name, component_obj);
    component(component_obj);
    if ((!component_obj.require || component_obj.require.platform === package.platform) && component_obj.init) {
        component_obj.init();
    }
    console.log(package.platform + ": Loaded " + component_obj.id);
    return component_obj;
}

function package_include(packages, callback) {
    var load = function (package_index, component_index) {
        var package_keys = Object.keys(packages);
        if (package_index >= package_keys.length) {
            if (callback) {
                callback();
            }
            return;
        }
        var package_name = package_keys[package_index];
        var components = packages[package_name];
        var component_name = components[component_index];
        console.log(package.platform + ": Loading " + package_name + "." + component_name);
        if (package.platform === "browser") {
            var ref = document.getElementsByTagName("script")[ 0 ];
            var script = document.createElement("script");
            script.src = "/packages/" + package_name + "/" + package_name + "_" + component_name + ".js?platform=browser";
            script.onload = function () {
                package_init(package_name, component_name);
                /* Load next component */
                component_index++;
                if (component_index >= components.length) {
                    package_index++;
                    component_index = 0;
                }
                load(package_index, component_index);
            };
            ref.parentNode.insertBefore(script, ref);
        } else {
            package[package_name + "." + component_name];
            component_index++;
            if (component_index >= components.length) {
                package_index++;
                component_index = 0;
            }
            load(package_index, component_index);
        }
    };
    load(0, 0);
}

function package_general(object, property) {
    /* Check if package exists */
    if (Reflect.has(object, property)) {
        return Reflect.get(object, property);
    }
    else if (typeof property === "string" && property.includes(".")) {
        return package_path(object, property);
    }
    else if (property === "platform") {
        return package_platform();
    }
    else if (property === "include") {
        return package_include;
    }
    else if (property === "send") {
        return function() {
            var args = Array.prototype.slice.call(arguments, 1);
            var method = Reflect.get(object, arguments[0]);
            console.log("Calling: " + arguments[0]);
            if(method) {
                method.apply(object, args);
            }
        }
    }
    else if(property in package) {
        return package[property];
    }
    return undefined;
}

var package = new Proxy({}, {
    get: function (object, property) {
        result = package_general(object, property);
        if (result) {
            return result;
        }
        if (property === "id") {
            return "package";
        }
        /* Create package proxy */
        package_obj = new Proxy({id: property, package: property}, {
            get: function (object, property) {
                result = package_general(object, property);
                if (result) {
                    return result;
                }
                if (property === "components") {
                    var components = Object.keys(object);
                    var components = components.filter(function (component) {
                        return component !== 'id' && component !== 'package' && component !== 'component';
                    });
                    return components;
                }
                /* Load component */
                var package_name = Reflect.get(object, "id");
                if (package.platform === "server") {
                    path = "./" + package_name + "/" + package_name + "_" + property;
                    require(path);
                } else if (package.platform === "client") {
                    importScripts("/packages/" + package_name + "/" + package_name + "_" + property + ".js?platform=client");
                } else {
                    /* browser can only load asyncronously components */
                    return null;
                }
                return package_init(package_name, property);
            },
            set: function (object, property, value) {
                Reflect.set(object, property, value);
            }
        });
        Reflect.set(object, property, package_obj);
        return package_obj;
    }
});

if (typeof require !== 'undefined') {
    global.package = package;
}
