function screens_platform() {
    var platform = "browser";
    if (typeof global !== "undefined" && global.platform) {
        platform = global.platform;
    }
    else if ("__source_platform__") {
        platform = "__source_platform__";
    }
    return platform;
}

function screens_setup(package_name, component_name, child_name, node) {
    var children = [];
    var id = package_name + "." + component_name;
    if (child_name) {
        node = node[child_name];
        id += "." + child_name;
    } else {
        node = screens.browse(id);
        for (var key in node) {
            children.push(key);
        }
    }
    if (node && node.id) {
        return [];
    }
    const isFunctionalComponent = component_name[0] !== component_name[0].toLowerCase();
    if (isFunctionalComponent) {
        return [];
    }
    if (typeof node !== "function") {
        if (child_name) {
            screens[package_name][component_name][child_name] = node;
        }
        return [];
    }
    var component_obj = Object.assign({
        log: screens.log,
        log_error: screens.log_error,
        log_warning: screens.log_warning,
        platform: screens.platform
    }, { id });
    if (child_name) {
        screens[package_name][component_name][child_name] = component_obj;
        component_obj.upper = screens[package_name][component_name];
    } else {
        screens[package_name][component_name] = component_obj;
    }
    var constructor = node;
    var init = null;
    var platform = constructor(component_obj, screens);
    if (typeof platform !== "string") {
        platform = null;
    }
    if (platform && screens.platform !== platform) {
        console.log(screens.platform + " => " + id + " => " + platform);
        let handler = {
            get: function (object, property) {
                if (property in object) {
                    return Reflect.get(object, property);
                }
                else {
                    return new Proxy(() => {
                        let path = object();
                        return path + "." + property;
                    }, handler);
                }
            },
            apply: function (target, thisArg, argumentList) {
                var args = Array.prototype.slice.call(argumentList);
                args.unshift(target());
                return screens.core.message["send_" + platform].apply(thisArg, args);
            }
        };
        component_obj = new Proxy(() => { return id; }, handler);
        component_obj = Object.assign(component_obj, screens, { id, remote: true });
        if (child_name) {
            screens[package_name][component_name][child_name] = component_obj;
            component_obj.upper = screens[package_name][component_name];
        } else {
            screens[package_name][component_name] = component_obj;
        }
    }
    else {
        component_obj.implement = async (me) => {
            var context = constructor(me, screens);
            var result = null;
            if (context.init) {
                result = await context.init();
            }
            return result;
        };
        if (!init) {
            init = { callback: component_obj.init, args: [component_obj], package_name, component_name, child_name };
        }
    }
    component_obj.require = platform;
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
    for (var item of items) {
        var initializers = item.initializers;
        if (initializers) {
            do {
                var init = initializers.shift();
                if (!init) {
                    continue;
                }
                if (init.callback) {
                    try {
                        var promise = init.callback.apply(init.this, init.args);
                        if (promise && promise.then) {
                            await promise;
                        }
                    }
                    catch (err) {
                        var error = err;
                        if (typeof error == "undefined") {
                            error = { message: "Unknown error" };
                        }
                        var message = error.message || error;
                        console.error(screens.platform + ": Failed to initialise component: " + init.package_name + "." + init.component_name + " with error: " + message + " stack: " + err.stack);
                    }
                }
            } while (init);
        }
    }
}

function screens_import(path) {
    if (screens.imports[path]) {
        return true;
    }
    screens.imports.push(path);
    if (screens.platform === "server" || screens.platform === "service") {
        require(path);
    }
    else if (screens.platform === "client" || screens.platform === "service_worker") {
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
        var tagNames = [];
        if (isScript) {
            tagNames = ["script"];
        }
        else if (isStylesheet) {
            tagNames = ["style", "link"];
        }
        for (var tagName of tagNames) {
            var items = document.getElementsByTagName(tagName);
            for (var i = items.length; i--;) {
                var target = items[i].src || items[i].href || items[i].id;
                if (!target) {
                    continue;
                }
                if (path.includes(target) || target.includes(path)) {
                    return items[i];
                }
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
                screens.log_error("Failure in stylesheet: " + path);
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
                    let path = "../code/" + item.package_name + "/" + item.package_name + "_" + item.component_name;
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
                let path = paths.join(",") + "?platform=" + screens.platform;
                if (state === "import") {
                    console.log(screens.platform + ": Loading " + path);
                    var promises = items[0].promises = [];
                    promises.push(screens_import(path));
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
        let names = packages.split(".");
        let package_name = names[0];
        let component_name = names[1];
        packages = {};
        packages[package_name] = [component_name];
    }
    var collection = {};
    for (let package_name in packages) {
        let components = packages[package_name];
        let items = [];
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
    for (let package_name in packages) {
        for (var item of collection[package_name]) {
            if (item.promises) {
                promises.push(...item.promises);
            }
        }
    }
    if (promises) {
        await Promise.all(promises);
    }
    for (let package_name in packages) {
        collection[package_name] = screens_load(collection[package_name], "setup");
    }
    for (let package_name in packages) {
        await screens_init(collection[package_name]);
    }
}

function screens_browse(path) {
    if (typeof path === "string") {
        return path.split(".").reduce((parent, name) => {
            if (parent) {
                return parent[name];
            }
        }, screens);
    }
}

async function screens_require(items) {
    var inits = [];
    if (screens.platform === "server") {
        for (let item of items) {
            require(item.module);
        }
    }
    for (let item of items) {
        var init = await screens_setup(item.package, item.component);
        inits.push(...init);
    }
    inits = inits.filter(Boolean);
    await screens_init([{ initializers: inits }]);
}

async function screens_requireAll(root, exclude) {
    var components = [];
    if (Array.isArray(root)) {
        for (let item of root) {
            let result = await screens_requireAll(item, exclude);
            components.push(...result);
        }
        return components;
    }
    var fs = require("fs");
    var names = fs.readdirSync(root);
    for (var name of names) {
        var path = root + "/" + name;
        var isDirectory = fs.statSync(path).isDirectory();
        if (isDirectory) {
            if (exclude && exclude.includes(name)) {
                continue;
            }
            components.push(... await screens_requireAll(path, exclude));
        }
        if (name.endsWith(".js")) {
            var module = path.split(".")[0].replace("packages", "..");
            module = module.replace("classes", "../../classes");
            var [the_package, component] = name.split(".")[0].split("_");
            if (!component) {
                continue;
            }
            if (!screens[the_package]) {
                screens[the_package] = {};
            }
            components.push({ package: the_package, component, module });
        }
    }
    return components;
}

var screens = {
    components: [],
    imports: [],
    id: "package",
    platform: screens_platform(),
    include: screens_include,
    import: screens_import,
    browse: screens_browse,
    require: screens_require,
    requireAll: screens_requireAll,
    log: function (message, componentId, userName) {
        screens.core.console.log.call(this, message, componentId, userName);
    },
    log_error: function (message, stack, componentId, userName) {
        screens.core.console.log_error.call(this, message, stack, componentId, userName);
    },
    log_warning: function (message, stack, componentId, userName) {
        screens.core.console.log_warning.call(this, message, stack, componentId, userName);
    },
};

if (screens.platform === "server" ||
    screens.platform === "service") {
    global.screens = screens;
}
