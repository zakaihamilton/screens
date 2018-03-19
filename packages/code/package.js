function package_lock(parent_task, callback) {
    if(typeof(parent_task) === "function") {
        callback = parent_task;
        parent_task = null;
    }
    while(parent_task && !parent_task.state) {
        parent_task = parent_task.parent;
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
        task.lock = 0;
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

function package_setup(task, package_name, component_name, child_name, callback, node = null) {
    var children = [];
    /* Retrieve component function */
    var id = package_name + "." + component_name;
    var component_id = id;
    if (!node) {
        node = package(id);
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
    var component = package_component(component_id);
    /* Create component proxy */
    var component_obj = new Proxy(() => {
        return { };
    }, {
        get: function (object, property) {
            if (Reflect.has(object, property)) {
                return Reflect.get(object, property);
            } else if(property in package) {
                return package[property];
            } else {
                var get = Reflect.get(object, "get");
                if (get && get.enabled) {
                    return get(object, property);
                }
            }
            return undefined;
        },
        apply: function(object, thisArg, argumentsList) {
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
    var requirement_platform = package.require(id);
    var init = !requirement_platform || requirement_platform.includes(package.platform);
    if(requirement_platform && package.platform !== requirement_platform) {
        node = function (me) {
            console.log("registering:" + id);
            me.get = function (object, property) {
                return function () {
                    var args = Array.prototype.slice.call(arguments);
                    args.unshift(id + "." + property);
                    me.core.message["send_" + requirement_platform].apply(null, args);
                };
            };
        };
        init = true;
    }
    if (init) {
        node(component_obj, child_name);
        var init_method = component_obj.init;
        if (component_obj.get) {
            component_obj.get.enabled = true;
        }
        if (init_method) {
            if (callback) {
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
    var file_name = package_name + "_" + component_name;
    var code_name = package_name + "." + component_name;
    if(child_name) {
        code_name = code_name + "." + child_name;
    }
    console.log(package.platform + ": Loading " + code_name);
    if (package_name in package) {
        if(package[package_name][component_name]) {
            if (callback) {
                callback({loaded: {package: package_name, component: component_name, child_name:child_name}});
                return;
            }
        }
    }
    else {
        package[package_name] = {};
    }
    try {
        if (package.platform === "server" || package.platform === "service") {
            path = "../" + package_type + "/" + package_name + "/" + file_name;
            require(path);
            package_prepare(package_name, component_name, child_name, callback);
        } else if (package.platform === "client" || package.platform === "browser") {
            if(!package._list) {
                package._list = [];
            }
            var url = file_name;
            var item = {
                url: url,
                package_type: package_type,
                package_name: package_name,
                component_name : component_name,
                child_name : child_name,
                callback : callback
            };
            package._list.push(item);
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
        var message = err.message || err;
        console.error("Failed to initialise component: " + name + " with error: " + message + " stack: " + err.stack);
    }
}

function package_complete(info, order, callback) {
    if (info) {
        if (callback) {
            callback(info);
        }
    }
    if(info && info.failure) {
        return;
    }
    package.lock(task => {
        order.map(function (id) {
            var ids = [id];
            if(id.includes("*")) {
                var package_name = id.split(".")[0];
                ids = Object.keys(package[package_name]).map((component_name) => {
                    return package_name + "." + component_name;
                });
            }
            ids.map((id) => {
                var component = package_component(id);
                if (component.init && component.init.length) {
                    console.log(package.platform + ": Initializing " + id);
                    do {
                        var init = component.init.shift();
                        if (init) {
                            package_init(id, init, task);
                        }
                    } while (init);
                }
            });
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

function package_script_load(callback, path) {
    var scripts = document.getElementsByTagName("script");
    for (var i = scripts.length; i--;) {
        if (scripts[i].src === path) {
            callback();
            return;
        }
    }
    var ref = scripts[ 0 ];
    var script = document.createElement("script");
    script.src = path;
    script.async = true;
    script.onload = callback;
    ref.parentNode.insertBefore(script, ref);
}

function package_handle_list(list) {
    var firstItem = list[0];
    if(firstItem.component_name === "*") {
        var index = 0;
        var count = Object.keys(package[firstItem.package_name]).length;
        list = Object.keys(package[firstItem.package_name]).map((component_name) => {
            return {
                package_name:firstItem.package_name,
                component_name:component_name,
                child_name:null,
                callback:(info) => {
                    index++;
                    if(index >= count && firstItem.callback) {
                        firstItem.callback(info);
                    }
                }
            };
        });
    }
    list.map((item) => {
        package_prepare(item.package_name, item.component_name, item.child_name, item.callback);
    });
};

function package_import_list(list) {
    if(list && list.length) {
        var first = true;
        var urls = list.map((item) => {
            var url = item.url;
            if(first) {
                 url = "/packages/" + item.package_type + "/" + item.package_name + "/" + url;
                first = false;
            }
            return url + ".js";
        });
        if(package.platform === "client") {
            var path = urls.join(",") + "?platform=client";
            importScripts(path);
            package_handle_list(list);
        }
        else if(package.platform === "browser") {
            var path = urls.join(",") + "?platform=browser";
            package_script_load(() => {
                package_handle_list(list);
            }, path);
        }
    }
}

function package_include(packages, callback, package_type="code") {
    if (typeof packages === "string" && packages) {
        var names = packages.split(".");
        var package_name = names[0];
        var component_name = names[1];
        var child_name = names[2];
        package_load(package_type, package_name, component_name, child_name, function (info) {
            package_complete(info, [packages], callback);
        });
        package_import_list(package._list);
        package._list = [];
        return;
    }
    var numComponents = 0;
    var loadedComponents = 0;
    var order = [];
    for (var package_name in packages) {
        packages[package_name].map(function (component_name) {
            var id = package_name + "." + component_name;
            order.push(id);
            numComponents++;
        });
    }
    for(var package_name in packages) {
        var components = packages[package_name];
        for(var component_name of components) {
            package_load(package_type, package_name, component_name, null, function (info) {
                if (info.failure) {
                    if (callback) {
                        callback(info);
                    }
                    return;
                }
                loadedComponents++;
                info.loadedComponents = loadedComponents;
                info.numComponents = numComponents;
                info.progress = (loadedComponents / numComponents) * 100;
                if (info.progress > 100) {
                    info.progress = 100;
                }
                if (loadedComponents >= numComponents) {
                    package_complete(info, order, callback);
                    return;
                }
                if (callback) {
                    callback(info);
                }
            });
        }
        package_import_list(package._list);
        package._list = [];
    }
}

var package = new Proxy(() => {
    return {};
}, {
    apply: function(object, thisArg, argumentsList) {
        return argumentsList[0].split('.').reduce((parent, name) => {
            return parent[name];
        }, package);
    }
});

Object.assign(package, {
    components: {},
    id: "package",
    platform : package_platform(),
    require: package_require,
    include: package_include,
    lock: package_lock,
    unlock: package_unlock
});

var platform = package_platform();
if (platform === "server" || platform === "service") {
    global.package = package;
    global.__json__ = {};
}
