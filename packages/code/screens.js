function screens_lock(parent_task, callback) {
    if (typeof (parent_task) === "function") {
        callback = parent_task;
        parent_task = null;
    }
    var task = { state: true, lock: 0, parent: parent_task};
    var next = task;
    while (next) {
        next.lock++;
        next = next.parent;
    }
    if (callback) {
        callback(task);
    }
}

function screens_unlock(task, callback) {
    if (callback) {
        task.callback = callback;
    }
    var next = task;
    while (next) {
        next.lock--;
        if (next.lock <= 0 && next.state) {
            next.lock = 0;
            if (next.callback) {
                next.callback(next);
            }
            next.state = false;
        }
        next = next.parent;
    }
}

function screens_forEach(task, array, callback, abortCallback) {
    var index = 0;
    screens_lock(task, (task) => {
        function iterate() {
            var exit = false;
            while (index < array.length && !exit) {
                screens_lock(task, (task) => {
                    var lock = task.lock;
                    var result = callback(task, array[index], index, array);
                    if(result) {
                        screens_unlock(task);
                        if(abortCallback) {
                            abortCallback(task, array[index], index, array);
                        }
                        exit = true;
                        return;
                    }
                    index++;
                    if (lock !== task.lock) {
                        screens_unlock(task, () => {
                            setTimeout(iterate, 0);
                        });
                        exit = true;
                        return;
                    }
                    screens_unlock(task);
                });
            }
            if(!exit) {
                screens_unlock(task);
            }
        }
        setTimeout(() => {
            iterate();
        }, 0);
    });
}

async function screens_async(task, promise) {
    var result;
    screens_lock(task, async (task) => {
        try {
            result = await promise;
            screens_unlock(task);
        }
        catch(err) {
            screens_unlock(task);
            throw err;
        }
    });
    return result;
}

function screens_platform() {
    var platform = "browser";
    if (typeof module !== 'undefined' && this.module !== module) {
        platform = global.platform || "server";
    } else if (typeof importScripts !== 'undefined') {
        platform = "client";
    }
    return platform;
}

function screens_setup(package_name, component_name, child_name, node) {
    var children = [];
    var id = package_name + "." + component_name;
    var component_id = id;
    if (child_name) {
        node = node[child_name];
        id += "." + child_name;
    } else {
        node = screens(id);
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
                } else if (property in screens) {
                    return screens[property];
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
        screens[package_name][component_name][child_name] = component_obj;
    } else {
        screens[package_name][component_name] = component_obj;
    }
    if (typeof node !== "function") {
        throw "Component " + id + " cannot be loaded stack: " + new Error().stack;
    }
    var platform = node(component_obj, child_name);
    if (platform && screens.platform !== platform) {
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
    console.log(screens.platform + ": Loaded " + component_obj.id);
    screens.components.push(component_obj.id);
    /* Load child components */
    var initializers = children.map(function (child) {
        return screens_setup(package_name, component_name, child, node);
    });
    initializers.unshift(init);
    initializers = initializers.reduce((a, b) => a.concat(b), []);
    return initializers;
}

function screens_push(package_name, component_name, callback) {
    var file_name = package_name + "_" + component_name;
    var code_name = package_name + "." + component_name;
    console.log(screens.platform + ": Loading " + code_name);
    if (package_name in screens) {
        if (screens[package_name][component_name]) {
            if (callback) {
                callback();
                return null;
            }
        }
    }
    else {
        screens[package_name] = {};
    }
    var item = {
        package_name: package_name,
        component_name: component_name,
        callback: callback
    };
    return item;
}

function screens_init(task, items) {
    screens.forEach(task, items, (task, item) => {
        var initializers = item.initializers;
        if (initializers) {
            console.log("initializing: " + item.package_name + "." + item.component_name);
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
                }
            } while (init);
            console.log("initialized: " + item.package_name + "." + item.component_name + (task.lock > 1 ? " waiting..." : ""));
        }
    });
}

function screens_import(callback, path) {
    if (screens.platform === "server" || screens.platform === "service") {
        require(path);
        callback();
    }
    else if (screens.platform === "client") {
        importScripts(path);
        callback();
    }
    else if (screens.platform === "browser") {
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

function screens_load(task, items, callback) {
    screens.lock(task, (task) => {
        if (items && items.length) {
            if (screens.platform === "server" || screens.platform === "service") {
                items.map((item) => {
                    var path = "../code/" + item.package_name + "/" + item.package_name + "_" + item.component_name;
                    screens.lock(task, (task) => {
                        screens_import(() => {
                            item.initializers = screens_setup(item.package_name, item.component_name);
                            screens.unlock(task);
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
                var path = paths.join(",") + "?platform=" + screens.platform;
                screens.lock(task, (task) => {
                    screens_import(() => {
                        var firstItem = items[0];
                        if (firstItem.component_name === "*") {
                            items = Object.keys(screens[firstItem.package_name]).map((component_name) => {
                                return {
                                    package_name: firstItem.package_name,
                                    component_name: component_name
                                };
                            });
                        }
                        items.map((item) => {
                            item.initializers = screens_setup(item.package_name, item.component_name);
                        });
                        screens.unlock(task);
                    }, path);
                });
            }
        }
        screens.unlock(task, () => {
            callback(items);
        });
    });
}

function screens_include(packages, callback) {
    if (typeof packages === "string" && packages) {
        var names = packages.split(".");
        var package_name = names[0];
        var component_name = names[1];
        packages = {};
        packages[package_name] = [component_name];
    }
    var collection = {};
    screens.lock((task) => {
        Object.entries(packages).forEach(([package_name, components]) => {
            screens.lock(task, (task) => {
                var items = [];
                components.forEach((component_name) => {
                    items.push(screens_push(package_name, component_name));
                });
                screens_load(task, items, (items) => {
                    collection[package_name] = items;
                });
                screens.unlock(task);
            });
        });
        screens.unlock(task, () => {
            screens.lock((task) => {
                screens.forEach(task, Object.keys(packages), (task, package_name) => {
                    screens_init(task, collection[package_name]);
                });
                screens.unlock(task, () => {
                    if(callback) {
                        callback();
                    }
                });
            });
        });
    });
}

var screens = new Proxy(() => {
    return {};
}, {
        apply: function (object, thisArg, argumentsList) {
            return argumentsList[0].split('.').reduce((parent, name) => {
                return parent[name];
            }, screens);
        }
    });

Object.assign(screens, {
    components: [],
    id: "package",
    platform: screens_platform(),
    include: screens_include,
    lock: screens_lock,
    unlock: screens_unlock,
    forEach: screens_forEach,
    async: screens_async
});

var platform = screens_platform();
if (platform === "server" || platform === "service") {
    global.screens = screens;
    global.__json__ = {};
}
