/*
 @author Zakai Hamilton
 @component CoreProperty
 */

screens.core.property = function CoreProperty(me) {
    me.init = function () {
        me._forwarding_list = {};
    };
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
            if (!object || !object.component) {
                return default_name;
            }
            name = object.component + "." + name;
        }
        if ("component" in object) {
            var redirect = screens(object.component).redirect;
            if (redirect && !redirect.disabled) {
                if (name in redirect) {
                    name = me.fullname(object, redirect[name]);
                }
            }
        }
        return name;
    };
    me.to_full_name = function(object, path) {
        if(typeof path === "string") {
            path = path.replace("@component", object.component);
            if(object.context) {
                object = object.context;
            }
            path = me.core.property.fullname(object, path, path);
        }
        return path;
    };
    me.get = async function (object, name, value = null, method = "get") {
        var result = undefined;
        if (Array.isArray(object)) {
            var results = [];
            for(item of object) {
                results.push(await me.core.property.get(item, name, value, method));
            }
            return results;
        }
        if (name !== null && typeof name === "object") {
            var results = {};
            for(subName in name) {
                var subValue = name[subName];
                results[subName] = await me.core.property.get(object, subName, subValue, method);
            }
            return results;
        }
        if (object && name && (typeof name !== "string" || !name.startsWith("!"))) {
            var info = me.split(object, name, value);
            if (typeof info.value === "string") {
                if (info.value.startsWith("@")) {
                    info.value = await me.core.property.get(info.object, info.value.substring(1));
                }
            }
            if (typeof info.name === "function") {
                result = info.name(info.object, info.value);
            } else {
                info.name = me.fullname(info.object, info.name);
                if (info.name) {
                    var callback = null;
                    try {
                        var callback = screens(info.name);
                    }
                    catch(err) {
                        me.log("no callback for: " + info.name);
                    }
                    if(callback) {
                        try {
                            if(typeof callback === "function") {
                                result = await callback(info.object, info.value);
                            }
                            else {
                                if(callback[method]) {
                                    result = await callback[method](info.object, info.value);
                                }
                            }
                        }
                        catch(err) {
                            err.message += " name: " + info.name + " method: " + method;
                            throw err;
                        }
                    }
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
                    if (args[0] !== "this") {
                        object = me.core.property.get(object, args[0]);
                    }
                    value = args[1];
                } else if (args.length === 1) {
                    value = args[0];
                }
            }
        }
        return {object: object, name: name, value: value};
    };
    me.link = function (source, target, enabled, object) {
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
        source_list[target] = enabled;
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
    me.set = async function (object, name, value) {
        if (!object || !name) {
            return;
        }
        if (Array.isArray(object)) {
            var results = me.map(object, async (item) => {
                return await me.core.property.set(item, name, value);
            });
            return results;
        }
        if (Array.isArray(name)) {
            var results = me.map(name, async (item) => {
                return await me.core.property.set(object, item, value);
            });
            return results;
        }
        if(typeof name === "string") {
            var source_method = me.core.property.fullname(object, name);
            await me.setTo(me._forwarding_list, object, source_method, value);
            await me.setTo(object._forwarding_list, object, source_method, value);
        }
        else if(typeof name !== "function") {
            var results = {};
            for(var key in name) {
                var value = name[key];
                await me.core.property.set(object, key, value);
            }
        }
        return await me.core.property.get(object, name, value, "set");
    };
    me.setTo = async function (list, object, name, value) {
        if (list) {
            var forwarding_list = list[name];
            if (forwarding_list) {
                for (var target in forwarding_list) {
                    var enabled = forwarding_list[target];
                    if (enabled) {
                        await me.core.property.set(object, target, value);
                    }
                }
            }
        }
    };
    me.group = {
        set: function(object, properties) {
            if (Array.isArray(properties)) {
                properties.map(function (item) {
                    for (var key in item) {
                        me.core.property.set(object, key, item[key]);
                    }
                });
                return;
            }
            for (var key in properties) {
                me.core.property.set(object, key, properties[key]);
            }
        }
    };
};
