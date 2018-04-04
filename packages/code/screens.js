function screens_lock(parent_task, callback) {
    if (typeof (parent_task) === "function") {
        callback = parent_task;
        parent_task = null;
    }
    var task = { state: true, lock: 0, parent: parent_task };
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

async function screens_map(object, callback) {
    if(Array.isArray(object)) {
        var results = [];
        for(var index = 0; index < object.length; index++) {
            results.push(await callback(object[index], index, object));
        }
        return results;
    }
    else {
        var results = {};
        for(var key in object) {
            results[item] = await callback(object[key], key, object);
        }
        return results;
    }
};

function screens_platform() {
    var platform = "browser";
    if (typeof module !== 'undefined' && this && this.module !== module) {
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

async function screens_init(items) {
    for (item of items) {
        var initializers = item.initializers;
        if (initializers) {
            console.log("initializing: " + item.package_name + "." + item.component_name);
            do {
                var init = initializers.shift();
                if (init) {
                    try {
                        var promise = init();
                        if (promise && promise.then) {
                            await promise;
                        }
                    }
                    catch (err) {
                        var message = err.message || err;
                        console.error("Failed to initialise component: " + item.package_name + "." + item.component_name + " with error: " + message + " stack: " + err.stack);
                    }
                }
            } while (init);
            console.log("initialized: " + item.package_name + "." + item.component_name);
        }
    }
}

async function screens_import(path) {
    if (screens.platform === "server" || screens.platform === "service") {
        require(path);
    }
    else if (screens.platform === "client") {
        importScripts(path);
    }
    else if (screens.platform === "browser") {
        var scripts = document.getElementsByTagName("script");
        for (var i = scripts.length; i--;) {
            if (scripts[i].src === path) {
                return;
            }
        }
        return new Promise((resolve, reject) => {
            var ref = scripts[0];
            var script = document.createElement("script");
            script.src = path;
            script.async = true;
            script.onload = resolve;
            ref.parentNode.appendChild(script);
        });
    }
}

async function screens_load(items) {
    if (items && items.length) {
        if (screens.platform === "server" || screens.platform === "service") {
            for(var item of items) {
                if (item.package_name in screens && item.component_name in screens[item.package_name]) {
                    return;
                }
                var path = "../code/" + item.package_name + "/" + item.package_name + "_" + item.component_name;
                await screens_import(path);
                item.initializers = screens_setup(item.package_name, item.component_name);
            }
        }
        else {
            var first = true;
            var paths = items.map((item) => {
                if (item.package_name in screens && item.component_name in screens[item.package_name]) {
                    return null;
                }
                var path = item.package_name + "_" + item.component_name;
                if (first) {
                    path = "/packages/code/" + item.package_name + "/" + path;
                    first = false;
                }
                return path + ".js";
            });
            paths = paths.filter(Boolean);
            if (paths.length) {
                var path = paths.join(",") + "?platform=" + screens.platform;
                await screens_import(path);
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
            }
        }
    }
    return items;
}

async function screens_include(packages) {
    if (typeof packages === "string" && packages) {
        var names = packages.split(".");
        var package_name = names[0];
        var component_name = names[1];
        packages = {};
        packages[package_name] = [component_name];
    }
    var collection = {};
    for(var package_name in packages) {
        var components = packages[package_name];
        var items = [];
        components.forEach((component_name) => {
            items.push(screens_push(package_name, component_name));
        });
        items = await screens_load(items);
        collection[package_name] = items;
    }
    for (package_name in packages) {
        console.log("initializing package: " + package_name);
        await screens_init(collection[package_name]);
    }
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
    map: screens_map,
});

var platform = screens_platform();
if (platform === "server" || platform === "service") {
    global.screens = screens;
    global.__json__ = {};
}
