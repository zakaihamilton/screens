function package_lock(parent_task, callback) {
    if (typeof (parent_task) === "function") {
        callback = parent_task;
        parent_task = null;
    }
    while (parent_task && !parent_task.state) {
        parent_task = parent_task.parent;
    }
    var task = { state: true, lock: 0, parent: parent_task };
    if (parent_task) {
        parent_task.lock++;
    }
    task.lock++;
    if (callback) {
        callback(task);
    }
}

function package_unlock(task, callback) {
    task.lock--;
    if (callback) {
        task.callback = callback;
    }
    if (task.lock <= 0 && task.state) {
        task.lock = 0;
        task.state = false;
        if (task.callback) {
            task.callback(task);
        }
        if (task.parent) {
            package_unlock(task.parent);
        }
    }
}

function package_forEach(task, array, callback) {
    var index = 0;
    function iterate() {
        var exit = false;
        while (index < array.length && !exit) {
            package_lock(task, (task) => {
                var lock = task.lock;
                callback(task, array[index], index++, array);
                if (lock !== task.lock) {
                    package_unlock(task, () => {
                        setTimeout(iterate, 0);
                    });
                    exit = true;
                    return;
                }
                package_unlock(task);
            });
        }
    }
    iterate();
}

function package_platform() {
    var platform = "browser";
    if (typeof module !== 'undefined' && this.module !== module) {
        platform = global.platform || "server";
    } else if (typeof importScripts !== 'undefined') {
        platform = "client";
    }
    return platform;
}

function package_setup(package_name, component_name, child_name, node) {
    var children = [];
    var id = package_name + "." + component_name;
    var component_id = id;
    if (child_name) {
        node = node[child_name];
        id += "." + child_name;
    } else {
        node = package(id);
        for (var key in node) {
            children.push(key);
        }
    }
    /* Create component proxy */
    var component_obj = new Proxy(() => {
        return {};
    }, {
            get: function (object, property) {
                if (Reflect.has(object, property)) {
                    return Reflect.get(object, property);
                } else if (property in package) {
                    return package[property];
                } else {
                    var get = Reflect.get(object, "get");
                    if (get && get.enabled) {
                        return get(object, property);
                    }
                }
                return undefined;
            },
            apply: function (object, thisArg, argumentsList) {
                var apply = Reflect.get(object, "apply");
                if (apply) {
                    return apply.apply(thisArg, argumentsList);
                }
            }
        });
    component_obj.id = id;
    component_obj.__package = package_name;
    component_obj.__component = component_name;
    if (child_name) {
        package[package_name][component_name][child_name] = component_obj;
    } else {
        package[package_name][component_name] = component_obj;
    }
    if (typeof node !== "function") {
        throw "Component " + id + " cannot be loaded stack: " + new Error().stack;
    }
    var platform = node(component_obj, child_name);
    if (platform && package.platform !== platform) {
        component_obj.apply = function (object, thisArg, argumentsList) {
            return function () {
                var args = Array.prototype.slice.call(argumentsList);
                args.unshift(id);
                me.core.message["send_" + platform].apply(null, args);
            };
        };
        component_obj.get = function (object, property) {
            return function () {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(id + "." + property);
                me.core.message["send_" + platform].apply(null, args);
            };
        };
    }
    component_obj.require = platform;
    var init = component_obj.init;
    if (component_obj.get) {
        component_obj.get.enabled = true;
    }
    console.log(package.platform + ": Loaded " + component_obj.id);
    package.components.push(component_obj.id);
    /* Load child components */
    var initializers = children.map(function (child) {
        return package_setup(package_name, component_name, child, node);
    });
    initializers.unshift(init);
    initializers = initializers.reduce((a, b) => a.concat(b), []);
    return initializers;
}

function package_push(package_name, component_name, callback) {
    var file_name = package_name + "_" + component_name;
    var code_name = package_name + "." + component_name;
    console.log(package.platform + ": Loading " + code_name);
    if (package_name in package) {
        if (package[package_name][component_name]) {
            if (callback) {
                callback();
                return null;
            }
        }
    }
    else {
        package[package_name] = {};
    }
    var item = {
        package_name: package_name,
        component_name: component_name,
        callback: callback
    };
    return item;
}

function package_init(task, items) {
    package.lock(task, task => {
        items.map(function (item) {
            var initializers = item.initializers;
            if (initializers) {
                do {
                    var init = initializers.shift();
                    if (init) {
                        try {
                            init(task);
                        }
                        catch (err) {
                            var message = err.message || err;
                            console.error("Failed to initialise component: " + item.package_name + "." + item.component_name + " with error: " + message + " stack: " + err.stack);
                        }
                        console.log("initialized: " + item.package_name + "." + item.component_name);
                    }
                } while (init);
            }
        });
        package.unlock(task);
    });
}

function package_import(callback, path) {
    if (package.platform === "server" || package.platform === "service") {
        require(path);
        callback();
    }
    else if (package.platform === "client") {
        importScripts(path);
        callback();
    }
    else if (package.platform === "browser") {
        var scripts = document.getElementsByTagName("script");
        for (var i = scripts.length; i--;) {
            if (scripts[i].src === path) {
                callback();
                return;
            }
        }
        var ref = scripts[0];
        var script = document.createElement("script");
        script.src = path;
        script.async = true;
        script.onload = callback;
        ref.parentNode.insertBefore(script, ref);
    }
}

function package_load(task, items, callback) {
    package.lock(task, (task) => {
        if (items && items.length) {
        if (package.platform === "server" || package.platform === "service") {
            items.map((item) => {
                var path = "../code/" + item.package_name + "/" + item.package_name + "_" + item.component_name;
                package.lock(task, (task) => {
                    package_import(() => {
                        item.initializers = package_setup(item.package_name, item.component_name);
                        package.unlock(task);
                    }, path);
                });
            });
        }
        else {
            var first = true;
            var paths = items.map((item) => {
                var path = item.package_name + "_" + item.component_name;
                if (first) {
                    path = "/packages/code/" + item.package_name + "/" + path;
                    first = false;
                }
                return path + ".js";
            });
            var path = paths.join(",") + "?platform=" + package.platform;
            package.lock(task, (task) => {
                package_import(() => {
                    var firstItem = items[0];
                    if (firstItem.component_name === "*") {
                        items = Object.keys(package[firstItem.package_name]).map((component_name) => {
                            return {
                                package_name: firstItem.package_name,
                                component_name: component_name
                            };
                        });
                    }
                    items.map((item) => {
                        item.initializers = package_setup(item.package_name, item.component_name);
                    });
                    package.unlock(task);
                }, path);
            });
        }
    }
    package.unlock(task, () => {
        callback(items);
    });
});
}

function package_include(packages, callback) {
    if (typeof packages === "string" && packages) {
        var names = packages.split(".");
        var package_name = names[0];
        var component_name = names[1];
        packages = {};
        packages[package_name] = [component_name];
    }
    var collection = {};
    package.lock((task) => {
        Object.entries(packages).forEach(([package_name, components]) => {
            package.lock(task, (task) => {
                var items = [];
                components.forEach((component_name) => {
                    items.push(package_push(package_name, component_name));
                });
                package_load(task, items, (items) => {
                    collection[package_name] = items;
                });
                package.unlock(task);
            });
        });
        package.unlock(task, () => {
            package.lock((task) => {
                package.forEach(task, Object.keys(packages), (task, package_name) => {
                    package_init(task, collection[package_name]);
                });
                package.unlock(task, callback);
            });
        });
    });
}

var package = new Proxy(() => {
    return {};
}, {
        apply: function (object, thisArg, argumentsList) {
            return argumentsList[0].split('.').reduce((parent, name) => {
                return parent[name];
            }, package);
        }
    });

Object.assign(package, {
    components: [],
    id: "package",
    platform: package_platform(),
    include: package_include,
    lock: package_lock,
    unlock: package_unlock,
    forEach: package_forEach
});

var platform = package_platform();
if (platform === "server" || platform === "service") {
    global.package = package;
    global.__json__ = {};
}
