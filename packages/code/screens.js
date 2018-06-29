function screens_platform() {
    var platform = "browser";
    if (typeof module !== 'undefined' && this && this.module !== module) {
        platform = global.platform || "server";
    } else if (typeof importScripts !== 'undefined') {
        platform = "client";
    }
    return platform;
}

function screens_create_proxy(id) {
    /* Create component proxy */
    var component_obj = new Proxy(() => {
        return {};
    }, {
            get: function (object, property) {
                if (Reflect.has(object, property)) {
                    return Reflect.get(object, property);
                } else if (property in screens) {
                    return screens[property];
                } else if (object.upper && Reflect.has(object.upper, property)) {
                    return Reflect.get(object.upper, property);
                } else {
                    var proxy = Reflect.get(object, "proxy");
                    if (proxy && proxy.get && proxy.get.enabled) {
                        return proxy.get(object, property);
                    }
                }
                return undefined;
            },
            apply: function (object, thisArg, argumentsList) {
                var proxy = Reflect.get(object, "proxy");
                if (proxy && proxy.apply) {
                    return proxy.apply.apply(thisArg, argumentsList);
                }
            }
        });
    component_obj.proxy = {};
    component_obj.id = id;
    return component_obj;
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
    if (node && node.id) {
        return [];
    }
    /* Create component proxy */
    var component_obj = screens_create_proxy(id);
    if (child_name) {
        screens[package_name][component_name][child_name] = component_obj;
        component_obj.upper = screens[package_name][component_name];
    } else {
        screens[package_name][component_name] = component_obj;
    }
    if (typeof node !== "function") {
        throw "Component " + id + " cannot be loaded stack: " + new Error().stack;
    }
    var platform = node(component_obj, child_name);
    var init = null;
    if (platform && screens.platform !== platform) {
        console.log(screens.platform + ": remote component: " + id + " = " + platform);
        component_obj = screens_create_proxy(id);
        component_obj.proxy.apply = function (object, thisArg, argumentsList) {
            return function () {
                var args = Array.prototype.slice.call(argumentsList);
                args.unshift(id);
                return component_obj.core.message["send_" + platform].apply(null, args);
            };
        };
        component_obj.proxy.get = function (object, property) {
            return function () {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(id + "." + property);
                return component_obj.core.message["send_" + platform].apply(null, args);
            };
        };
        if (child_name) {
            screens[package_name][component_name][child_name] = component_obj;
            component_obj.upper = screens[package_name][component_name];
        } else {
            screens[package_name][component_name] = component_obj;
        }
    }
    else {
        init = { callback: component_obj.init, args: [component_obj] };
    }
    component_obj.require = platform;
    if (component_obj.proxy && component_obj.proxy.get) {
        component_obj.proxy.get.enabled = true;
    }
    console.log(screens.platform + ": Loaded " + id);
    screens.components.push(id);
    /* Load child components */
    var initializers = children.map(function (child) {
        return screens_setup(package_name, component_name, child, node);
    });
    if (init) {
        initializers.unshift(init);
        initializers = initializers.reduce((a, b) => a.concat(b), []);
    }
    return initializers;
}

async function screens_init(items) {
    for (item of items) {
        var initializers = item.initializers;
        if (initializers) {
            console.log(screens.platform + ": initializing: " + item.package_name + "." + item.component_name);
            do {
                var init = initializers.shift();
                if (init && init.callback) {
                    try {
                        var promise = init.callback.apply(null, init.args);
                        if (promise && promise.then) {
                            await promise;
                        }
                    }
                    catch (err) {
                        var message = err.message || err;
                        console.error(screens.platform + ": Failed to initialise component: " + item.package_name + "." + item.component_name + " with error: " + message + " stack: " + err.stack);
                    }
                }
            } while (init);
            console.log(screens.platform + ": initialized: " + item.package_name + "." + item.component_name);
        }
    }
}

function screens_import(path, optional) {
    if (screens.imports[path]) {
        return true;
    }
    screens.imports.push(path);
    if (screens.platform === "server" || screens.platform === "service") {
        require(path);
    }
    else if (screens.platform === "client") {
        try {
            importScripts(path);
        }
        catch (e) {
            console.error("Failure in importing: " + path);
            throw e;
        }
    }
    else if (screens.platform === "browser") {
        var isScript = path.includes(".js");
        var isStylesheet = path.includes(".css");
        var tagName = "";
        if (isScript) {
            tagName = "script";
        }
        else if (isStylesheet) {
            tagName = "link";
        }
        var items = document.getElementsByTagName(tagName);
        for (var i = items.length; i--;) {
            var target = items[i].src || items[i].href;
            if (target.includes(path)) {
                return items[i];
            }
        }
        return new Promise((resolve, reject) => {
            var ref = items[0];
            var parentNode = null;
            if (ref) {
                parentNode = ref.parentNode;
            }
            else {
                parentNode = document.getElementsByTagName("head")[0];
            }
            var item = document.createElement(tagName);
            if (isScript) {
                item.src = path;
                item.async = true;
            }
            if (isStylesheet) {
                item.href = path;
                item.type = "text/css";
                item.rel = "stylesheet";
                item.media = "screen,print";
            }
            item.onload = () => {
                resolve(item);
            };
            item.onerror = () => {
                screens.error("Failure in stylesheet: " + path);
                reject();
            };
            parentNode.appendChild(item);
        });
    }
}

function screens_load(items, state) {
    if (items && items.length) {
        if (screens.platform === "server" || screens.platform === "service") {
            for (var item of items) {
                if (state === "import") {
                    if (item.package_name in screens && item.component_name in screens[item.package_name]) {
                        continue;
                    }
                    var path = "../code/" + item.package_name + "/" + item.package_name + "_" + item.component_name;
                    console.log(screens.platform + ": Loading " + path);
                    item.promises = [screens_import(path)];
                }
                else if (state === "setup") {
                    item.initializers = screens_setup(item.package_name, item.component_name);
                }
            }
        }
        else {
            var first = true;
            var paths = items.map((item) => {
                if (state === "import") {
                    if (item.package_name in screens && item.component_name in screens[item.package_name]) {
                        return null;
                    }
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
                if (state === "import") {
                    console.log(screens.platform + ": Loading " + path);
                    var promises = items[0].promises = [];
                    promises.push(screens_import(path));
                    var firstItem = items[0];
                    if (firstItem.component_name === "*" && screens.platform === "browser") {
                        promises.push(screens_import(path.replace(/\.js/gi, ".css"), true));
                    }
                }
                else if (state === "setup") {
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
    for (var package_name in packages) {
        var components = packages[package_name];
        var items = [];
        if (!(package_name in screens)) {
            screens[package_name] = {};
        }
        components.forEach((component_name) => {
            var item = {
                package_name: package_name,
                component_name: component_name
            };
            items.push(item);
        });
        items = screens_load(items, "import");
        collection[package_name] = items;
    }
    var promises = [];
    for (package_name in packages) {
        for (var item of collection[package_name]) {
            if (item.promises) {
                promises.push(...item.promises);
            }
        }
    }
    if (promises) {
        await Promise.all(promises);
    }
    for (package_name in packages) {
        collection[package_name] = screens_load(collection[package_name], "setup");
    }
    for (package_name in packages) {
        console.log(screens.platform + ": initializing package: " + package_name);
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
    imports: [],
    id: "package",
    platform: screens_platform(),
    include: screens_include,
    import: screens_import
});

var platform = screens_platform();
if (platform === "server" || platform === "service") {
    global.screens = screens;
    global.__json__ = {};
    global.__html__ = {};
}

if (platform === "browser" || platform === "client") {
    var module = screens;
}
