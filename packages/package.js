function package_path(path) {
    var items = path.split(".");
    var item = package;
    for (var part_index = 0; part_index < items.length; part_index++) {
        item = item[items[part_index]];
        if (!item) {
            throw path + " not found";
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

function package_order(id) {
    if (package.order.indexOf(id) === -1) {
        package.order.push(id);
    }
}

function package_component(id) {
    var item = package.components[id];
    if (!item) {
        item = package.components[id] = {};
    }
    return item;
}

function package_require(id, platform) {
    var component = package_component(id);
    if (typeof platform !== "undefined") {
        component.require = platform;
    }
    return component.require;
}

function package_remote(id, platform) {
    var component = package_component(id);
    if (typeof platform !== "undefined") {
        component.remote = platform;
    }
    return component.remote;
}

function package_init(package_name, component_name, callback, child_name = null, node = null) {
    var children = [];
    /* Retrieve component function */
    var id = package_name + "." + component_name;
    var component_id = id;
    if (!node) {
        node = package.path(id);
    }
    if (child_name) {
        node = node[child_name];
        id += "." + child_name;
    } else {
        /* Check if there are any child components */
        for (var key in node) {
            children.push(key);
        }
    }
    /* Register component in package */
    package[package_name].components.push(id);
    /* Create component proxy */
    var component_obj = new Proxy({package:package, id: id, child: child_name}, {
        get: function (object, property) {
            var result = undefined;
            if (Reflect.has(object, property)) {
                return Reflect.get(object, property);
            } else if (property !== "forward" && Reflect.has(object, "forward")) {
                var forward = Reflect.get(object, "forward");
                if (forward && forward.enabled) {
                    return forward(object, property);
                }
            }
            return undefined;
        }
    });
    if (child_name) {
        package[package_name][component_name][child_name] = component_obj;
    } else {
        package[package_name][component_name] = component_obj;
    }
    if (typeof node !== "function") {
        throw "Component " + id + " cannot be loaded stack: " + new Error().stack;
    }
    var requirement_platform = package.require(id);
    if (!requirement_platform || requirement_platform === package.platform) {
        node(component_obj, child_name);
        var init_method = component_obj.init;
        if (component_obj.forward) {
            component_obj.forward.enabled = true;
        }
        if (init_method) {
            if (callback) {
                var component = package_component(component_id);
                if (!component.init) {
                    component.init = [];
                }
                component.init.push(init_method);
            } else {
                init_method();
            }
        }
    }
    console.log(package.platform + ": Loaded " + component_obj.id);
    /* Load child components */
    children.map(function (child) {
        package_init(package_name, component_name, callback, child, node);
    });
    return component_obj;
}

function package_prepare(package_name, component_name, callback) {
    var component = package_init(package_name, component_name, callback);
    if (callback) {
        callback({loaded: {package: package_name, component: component_name}});
    }
    return component;
}

function package_load(package_name, component_name, callback) {
    console.log(package.platform + ": Loading " + package_name + "." + component_name);
    if (package_name in package) {
        if (component_name in package[package_name]) {
            if (callback) {
                callback({loaded: {package: package_name, component: component_name}});
                return;
            }
        }
    }
    else {
        package[package_name] = {id: package_name, package: package_name, components: []};
    }
    try {
        if (package.platform === "browser") {
            var ref = document.getElementsByTagName("script")[ 0 ];
            var script = document.createElement("script");
            script.src = "/packages/" + package_name + "/" + package_name + "_" + component_name + ".js?platform=browser";
            script.onload = function () {
                try {
                    package_prepare(package_name, component_name, callback);
                } catch (err) {
                    console.log("Found error: " + err + " stack: " + err.stack);
                    if (callback) {
                        callback({failure: {package: package_name, component: component_name}});
                    }
                }
            };
            ref.parentNode.insertBefore(script, ref);
        } else if (package.platform === "server") {
            path = "./" + package_name + "/" + package_name + "_" + component_name;
            require(path);
            package_prepare(package_name, component_name, callback);
        } else if (package.platform === "client") {
            importScripts("/packages/" + package_name + "/" + package_name + "_" + component_name + ".js?platform=client");
            package_prepare(package_name, component_name, callback);
        }
    } catch (err) {
        console.log("Found error: " + err + " stack: " + err.stack);
        if (callback) {
            callback({failure: {package: package_name, component: component_name}});
        }
    }
}

function package_complete(info, callback) {
    if (info) {
        if (callback) {
            callback(info);
        }
    }
    if(info && info.failure) {
        return;
    }
    package.order.map(function (id) {
        var component = package_component(id);
        if (component.init) {
            do {
                var init = component.init.shift();
                if (init) {
                    init();
                }
            } while (init);
        }
    });
    if (info) {
        if (info.loaded) {
            info.complete = true;
        }
        if (callback) {
            callback(info);
        }
    }
}

function package_include(packages, callback) {
    if (typeof packages === "string" && packages) {
        var separator = packages.indexOf(".");
        var package_name = packages.substr(0, separator);
        var component_name = packages.substr(separator + 1);
        package_order(package_name + "." + component_name);
        package_load(package_name, component_name, function (info) {
            package_complete(info, callback);
        });
        return;
    }
    var numComponents = 0;
    var loadedComponents = 0;
    for (var package_name in packages) {
        packages[package_name].map(function (component_name) {
            var id = package_name + "." + component_name;
            package_order(id);
            var component = package_component(id);
            component.status = false;
            numComponents++;
        });
    }
    var load = function (package_index, component_index) {
        var package_keys = Object.keys(packages);
        if (package_index >= package_keys.length) {
            return;
        }
        var package_name = package_keys[package_index];
        var components = packages[package_name];
        var component_name = components[component_index];
        package_load(package_name, component_name, function (info) {
            if (info.failure) {
                if (callback) {
                    callback(info);
                }
                return;
            }
            var component = package_component(info.package + "." + info.component);
            component.status = true;
            loadedComponents++;
            info.progress = (loadedComponents / numComponents) * 100;
            if (info.progress > 100) {
                info.progress = 100;
            }
            if (loadedComponents >= numComponents) {
                package_complete(info, callback);
                return;
            }
            if (callback) {
                callback(info);
            }
        });
        /* Load next component */
        component_index++;
        if (component_index >= components.length) {
            package_index++;
            component_index = 0;
        }
        load(package_index, component_index);
    };
    load(0, 0);
}

var package = {
    components: {},
    order: [],
    id: "package",
    path : package_path,
    platform : typeof require !== 'undefined' ? "server" : (typeof importScripts !== 'undefined' ? "client" : "browser"),
    require: package_require,
    include: package_include,
    remote: package_remote
};

if (typeof require !== 'undefined') {
    global.package = package;
    global.__json__ = {};
}
