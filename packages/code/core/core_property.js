/*
 @author Zakai Hamilton
 @component CoreProperty
 */

screens.core.property = function CoreProperty(me) {
    me.fullname = function (object, name, default_name = null) {
        if (typeof name !== "string") {
            throw JSON.stringify(name) + " is not a string" + " stack: " + new Error().stack;
        }
        name = name.replace("screens.", "");
        var separator = name.indexOf(".");
        var package_name = null;
        if (separator !== -1) {
            package_name = name.substr(0, separator);
        }
        if (!package_name || !(package_name in screens)) {
            if (!object || !object.component || object === "none") {
                return default_name;
            }
            name = object.component + "." + name;
        }
        if (typeof object === "object" && "component" in object) {
            var lookup = screens.browse(object.component);
            if (lookup) {
                var redirect = lookup.redirect;
                if (redirect && !redirect.disabled) {
                    if (name in redirect) {
                        name = me.fullname(object, redirect[name]);
                    }
                }
            }
        }
        return name;
    };
    me.to_full_name = function (object, path) {
        if (typeof path === "string") {
            path = path.replace("@component", object.component);
            if (object.context) {
                object = object.context;
            }
            path = me.core.property.fullname(object, path, path);
        }
        return path;
    };
    me.has = function (object, name) {
        return me.get(object, name, null, "set", true);
    };
    me.get = function (object, name, value = undefined, method = "get", check = false) {
        var result = undefined;
        if (Array.isArray(object)) {
            var results = [];
            for (item of object) {
                var result = me.core.property.get(item, name, value, method);
                results.push(result);
            }
            return results;
        }
        if (name !== null && typeof name === "object") {
            var results = {};
            for (subName in name) {
                var subValue = name[subName];
                var result = me.core.property.get(object, subName, subValue, method);
                results[subName] = result;
            }
            return results;
        }
        if (object && name && (typeof name !== "string" || !name.startsWith("!"))) {
            var info = me.split(object, name, value);
            if (!info.object) {
                return;
            }
            if (typeof info.name === "string") {
                if (info.name.startsWith("@")) {
                    info.value = me.core.property.get(info.object, info.name.substring(1), info.value);
                    if (info.value && info.value.then) {
                        info.value.then((newValue) => {
                            me.get(object, info.name, newValue, method, check);
                        });
                        return info.value;
                    }
                }
            }
            if (typeof info.value === "string") {
                if (info.value.startsWith("@")) {
                    info.value = me.core.property.get(info.object, info.value.substring(1));
                    if (info.value && info.value.then) {
                        info.value.then((newValue) => {
                            me.get(object, info.name, newValue, method, check);
                        });
                        return info.value;
                    }
                }
            }
            if (typeof info.name === "function") {
                result = info.name(info.object, info.value);
            } else {
                var target = null;
                if (typeof info.name === "string") {
                    info.name = me.fullname(info.object, info.name);
                    if (info.name) {
                        var tokens = info.name.split(".");
                        var property = tokens.pop();
                        var path = tokens.join(".");
                        var component = null;
                        try {
                            component = screens.browse(path);
                        }
                        catch (err) {
                            me.log("no component for: " + info.name);
                        }
                        if (component) {
                            if (property in component) {
                                target = component[property];
                            }
                            else if ("lookup" in component) {
                                target = component.lookup;
                            }
                            else {
                                target = component[property];
                            }
                        }
                    }
                }
                else {
                    target = info.name;
                }
                if (target) {
                    try {
                        if (typeof target === "function") {
                            if (check) {
                                return true;
                            }
                            if (info.object === "none") {
                                result = target(info.value, property);
                            }
                            else {
                                result = target(info.object, info.value, property);
                            }
                        }
                        else if (typeof target === "object") {
                            if (target[method]) {
                                if (check) {
                                    return true;
                                }
                                result = target[method](info.object, info.value, property);
                            }
                        }
                        else {
                            result = target;
                        }
                    }
                    catch (err) {
                        err.message += " name: " + info.name + " method: " + method;
                        throw err;
                    }
                }
                if (check) {
                    return false;
                }
            }
        }
        return result;
    };
    me.split = function (object, name, value) {
        if (typeof name === "string") {
            var openIdx = name.indexOf("(");
            var closeIdx = name.lastIndexOf(")");
            if (openIdx !== -1 && closeIdx !== -1) {
                var args = name.substr(openIdx + 1, closeIdx - openIdx - 1).split(",");
                name = name.substr(0, openIdx);
                if (args.length > 1) {
                    if (args[0] === "none") {
                        object = args[0];
                    }
                    else if (args[0] !== "this") {
                        object = me.core.property.get(object, args[0]);
                    }
                    value = args[1];
                } else if (args.length === 1) {
                    value = args[0];
                }
            }
        }
        return { object: object, name: name, value: value };
    };
    me.link = function (source, target, beforeProperty, object) {
        if (!object) {
            object = me;
        }
        if (object && object !== me) {
            source = me.core.property.fullname(object, source);
            target = me.core.property.fullname(object, target);
        }
        var forwarding_list = object._forwarding_list;
        if (!forwarding_list) {
            forwarding_list = {};
            object._forwarding_list = forwarding_list;
        }
        var source_list = forwarding_list[source];
        if (!source_list) {
            source_list = {};
            forwarding_list[source] = source_list;
        }
        source_list[target] = beforeProperty;
    };
    me.notify = function (object, name, value) {
        if (!object) {
            return;
        }
        if (!object.notifications) {
            object.notifications = {};
        }
        if (object.notifications[name]) {
            return;
        }
        object.notifications[name] = setTimeout(function () {
            object.notifications[name] = null;
            me.core.property.set(object, name, value);
        }, 250);
    };
    me.sendToLinks = function (object, name, value, beforeProperty) {
        var allPromises = [];
        var source_method = me.core.property.fullname(object, name);
        var promises = me.setTo(me._forwarding_list, object, source_method, value, beforeProperty);
        if (promises) {
            allPromises.push(...promises);
        }
        promises = me.setTo(object._forwarding_list, object, source_method, value, beforeProperty);
        if (promises) {
            allPromises.push(...promises);
        }
        return allPromises;
    };
    me.set = function (object, name, value) {
        if (!object || !name) {
            return;
        }
        if (Array.isArray(object)) {
            var results = object.map((item) => {
                return me.core.property.set(item, name, value);
            });
            return results;
        }
        if (Array.isArray(name)) {
            var results = [];
            for (var item of name) {
                results.push(me.core.property.set(object, item, value));
            }
            return results;
        }
        var promises = [];
        if (typeof name === "string") {
            var subPromises = me.sendToLinks(object, name, value, true);
            if (subPromises.length) {
                promises.push(...subPromises);
            }
        }
        else if (typeof name !== "function") {
            var results = {};
            for (var key in name) {
                var value = name[key];
                me.core.property.set(object, key, value);
            }
        }
        var result = me.core.property.get(object, name, value, "set");
        if (typeof name === "string") {
            var subPromises = me.sendToLinks(object, name, value, false);
            if (subPromises.length) {
                promises.push(...subPromises);
            }
        }
        promises.push(result);
        if (promises.length > 1) {
            result = Promise.all(promises);
        }
        else if (promises.length === 1) {
            result = promises[0];
        }
        return result;
    };
    me.setTo = function (list, object, name, value, beforeProperty) {
        var promises = [];
        if (list) {
            var forwarding_list = list[name];
            if (forwarding_list) {
                for (var target in forwarding_list) {
                    var propertyState = forwarding_list[target];
                    if (propertyState === beforeProperty) {
                        var result = me.core.property.set(object, target, value);
                        if (result && result.then) {
                            promises.push(result);
                        }
                    }
                }
            }
        }
        return promises;
    };
    me.group = {
        set: function (object, properties) {
            if (!Array.isArray(properties)) {
                properties = [properties];
            }
            for (var property of properties) {
                for (var key in property) {
                    me.core.property.set(object, key, property[key]);
                }
            }
        }
    };
};

screens.core.property.object = function CorePropertyObject(me) {
    me.create = function (component, object = null) {
        if (!object) {
            object = {};
        }
        object.values = {};
        object.dirty = {};
        object.component = component.id;
        return object;
    };
    me.lookup = {
        set: function (object, info, property) {
            var componentId = object.id || object.component;
            if (info && info.component) {
                componentId = info.component;
                property = componentId + "." + property;
            }
            var name = componentId + "." + property;
            object[property] = {
                get: function (object) {
                    var dirty = true;
                    var value = null;
                    var dynamic = false;
                    if (!object) {
                        return null;
                    }
                    if (info) {
                        if ("dirty" in info) {
                            var callback = info["dirty"];
                            if (object.dirty && name in object.dirty) {
                                dirty = object.dirty[name];
                            }
                            if (dirty && callback) {
                                value = callback(object, property);
                                if (typeof value !== "undefined") {
                                    dynamic = true;
                                    object.values[name] = value;
                                    object.dirty[name] = false;
                                }
                            }
                        }
                        if (!dynamic && info && "get" in info) {
                            var callback = info["get"];
                            if (callback) {
                                value = callback(object, property);
                                if (typeof value !== "undefined") {
                                    dynamic = true;
                                }
                            }
                        }
                    }
                    if (!dynamic && object.values && name in object.values) {
                        value = object.values[name];
                    }
                    return value;
                },
                set: function (object, value) {
                    var result = object;
                    if (!object) {
                        return;
                    }
                    if (!object.values) {
                        object.values = {};
                    }
                    if (!object.dirty) {
                        object.dirty = {};
                    }
                    var oldValue = object.values[name];
                    object.dirty[name] = false;
                    if (oldValue === value) {
                        return;
                    }
                    if (!info || !info.immutable) {
                        object.values[name] = value;
                    }
                    if (info && "set" in info) {
                        var callback = info["set"];
                        if (callback) {
                            result = callback(object, value, property, oldValue);
                        }
                    }
                    return result;
                },
                dirty: function (object) {
                    if (!object) {
                        return;
                    }
                    if (!object.values) {
                        object.dirty = {};
                    }
                    object.dirty[name] = true;
                }
            };
        }
    };
};
