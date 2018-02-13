function package_browse(path, optional) {
    var items = path.split(".");
    var item = package;
    for (var part_index = 0; part_index < items.length; part_index++) {
        item = item[items[part_index]];
        if (!item) {
            if(optional) {
                return null;
            }
            else {
                throw path + " not found";
            }
        }
    }
    return item;
}

function package_lock(parent_task, callback) {
    if(typeof(parent_task) === "function") {
        callback = parent_task;
        parent_task = null;
    }
    var task = {state:true,lock:0,parent:parent_task};
    if(parent_task) {
        parent_task.lock++;
    }
    task.lock++;
    if(callback) {
        callback(task);
    }
}

function package_unlock(task, callback) {
    task.lock--;
    if(callback) {
        task.callback = callback;
    }
    if(task.lock <= 0 && task.state) {
        task.state = false;
        if(task.callback) {
            task.callback(task);
        }
        if(task.parent) {
            package_unlock(task.parent);
        }
    }
}

function package_platform() {
    var platform = "browser";
    if (typeof module !== 'undefined' && this.module !== module) {
        if(global.platform) {
            platform = global.platform;
        }
        else {
            platform = "server";
        }
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
    var support = "";
    if (typeof platform !== "undefined") {
        component.remote = platform;
    }
    if(component.remote) {
        support = component.remote;
    }
    else if(component.require) {
        support = component.require;
    }
    return support;
}

function package_setup(task, package_name, component_name, child_name, callback, node = null) {
    var children = [];
    /* Retrieve component function */
    var id = package_name + "." + component_name;
    var component_id = id;
    if (!node) {
        node = package.browse(id);
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
    package.count++;
    /* Create component proxy */
    var component_obj = new Proxy({id: id, __package:package_name, __component:component_name}, {
        get: function (object, property) {
            var result = undefined;
            if (Reflect.has(object, property)) {
                return Reflect.get(object, property);
            } else if(property in package) {
                return package[property];
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
    var init = !requirement_platform || requirement_platform.includes(package.platform);
    if(package.platform === "service") {
        var remote = package.remote(id);
        if(remote && remote.includes("server") && !remote.includes("service")) {
            node = function (me) {
                console.log("registering:" + id);
                me.forward = function (object, property) {
                    return function () {
                        var args = Array.prototype.slice.call(arguments);
                        args.unshift(id + "." + property);
                        me.core.message.send_server.apply(null, args);
                    };
                };
            };
            init = true;
        }
    }
    if (init) {
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
                package_init(id, init_method, task);
            }
        }
    }
    console.log(package.platform + ": Loaded " + component_obj.id);
    /* Load child components */
    children.map(function (child) {
        package_setup(task, package_name, component_name, child, callback, node);
    });
}

function package_prepare(package_name, component_name, child_name, callback) {
    package.lock(task => {
        package_setup(task, package_name, component_name, child_name, callback);
        package.unlock(task, () => {
            if (callback) {
                callback({loaded: {package: package_name, component: component_name, child:child_name}});
            }
        });
    });
}

function package_load(package_type, package_name, component_name, child_name, callback) {
    var file_name = package_name + "/" + package_name + "_" + component_name;
    var code_name = package_name + "." + component_name;
    if(child_name) {
        code_name = code_name + "." + child_name;
    }
    console.log(package.platform + ": Loading " + code_name);
    if (package_name in package) {
        if (package_browse(code_name, true)) {
            if (callback) {
                callback({loaded: {package: package_name, component: component_name, child_name:child_name}});
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
            script.src = "/packages/" + package_type + "/" + file_name + ".js?platform=browser";
            script.onload = function () {
                try {
                    package_prepare(package_name, component_name, child_name, callback);
                } catch (err) {
                    console.error("Found error: " + err + " stack: " + err.stack);
                    if (callback) {
                        callback({failure: {package: package_name, component: component_name, child:child_name}});
                    }
                }
            };
            ref.parentNode.insertBefore(script, ref);
        } else if (package.platform === "server" || package.platform === "service") {
            path = "../" + package_type + "/" + file_name;
            require(path);
            package_prepare(package_name, component_name, child_name, callback);
        } else if (package.platform === "client") {
            importScripts("/packages/" + package_type + "/" + file_name + ".js?platform=client");
            package_prepare(package_name, component_name, child_name, callback);
        }
    } catch (err) {
        console.error("Found error: " + err + " stack: " + err.stack);
        if (callback) {
            callback({failure: {package: package_name, component: component_name, child:child_name}});
        }
    }
}

function package_init(name, callback, task) {
    try {
        callback(task);
    }
    catch(err) {
        console.error("Failed to initialise component: " + name + " with error: " + err.message + " stack: " + err.stack);
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
    package.lock(task => {
        package.order.map(function (id) {
            var component = package_component(id);
            if (component.init) {
                console.log(package.platform + ": Initializing " + id);
                do {
                    var init = component.init.shift();
                    if (init) {
                        package_init(id, init, task);
                    }
                } while (init);
            }
        });
        package.unlock(task, () => {
            if (info) {
                if (info.loaded) {
                    info.complete = true;
                }
                if (callback) {
                    callback(info);
                }
            }
        });
    });
}

function package_include(packages, callback, package_type="code") {
    if (typeof packages === "string" && packages) {
        var names = packages.split(".");
        var package_name = names[0];
        var component_name = names[1];
        var child_name = names[2];
        package_order(packages);
        package_load(package_type, package_name, component_name, child_name, function (info) {
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
        package_load(package_type, package_name, component_name, null, function (info) {
            if (info.failure) {
                if (callback) {
                    callback(info);
                }
                return;
            }
            var component = package_component(info.package + "." + info.component);
            component.status = true;
            loadedComponents++;
            info.loadedComponents = loadedComponents;
            info.numComponents = numComponents;
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

function package_alias(object, aliases) {
    for(var alias in aliases) {
        object[alias] = package_browse(aliases[alias]);
    }
}

var package = {
    components: {},
    order: [],
    id: "package",
    browse : package_browse,
    platform : package_platform(),
    require: package_require,
    include: package_include,
    remote: package_remote,
    lock: package_lock,
    unlock: package_unlock,
    alias: package_alias,
    count: 0
};

var platform = package_platform();
if (platform === "server" || platform === "service") {
    global.package = package;
    global.__json__ = {};
}
