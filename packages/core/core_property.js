/*
 @author Zakai Hamilton
 @component CoreProperty
 */

package.core.property = function CoreProperty(me) {
    me.init = function() {
        me._forwarding_list = {};
        package.get = me.get;
        package.set = me.set;
        package.dirty = me.dirty;
        package.link = me.link;
        package.notify = me.notify;
    };
    me.fullname = function(object, name, default_name=null) {
        if(typeof name !== "string") {
            throw JSON.stringify(name) + " is not a string" + " stack: " + new Error().stack;
        }
        var separator = name.indexOf(".");
        var package_name = null;
        if(separator !== -1) {
            package_name = name.substr(0, separator);
        }
        if(!package_name || !(package_name in package)) {
            if(!object.component) {
                return default_name;
            }
            name = object.component + "." + name;
        }
        if(object.component) {
            var redirect = package[object.component].redirect;
            if(redirect) {
                if(name in redirect) {
                    name = me.fullname(object, redirect[name]);
                }
            }
        }
        return name;
    };
    me.get = function(object, name, value=null, method="get") {
        var result = undefined;
        if(object && name && (typeof name !== "string" || !name.includes("!"))) {
            if(typeof name === "function") {
                result = name(object, value);
            }
            else {
                name = me.fullname(object, name);
                if(name) {
                    result = me.send(name + "." + method, object, value);
                }
            }
        }
        return result;
    };
    me.setSingle = function(object, name, value=null, method="set") {
        var result = undefined;
        if (Array.isArray(object)) {
            var results = object.map(function (item) {
                return me.setSingle(item, name, value, method);
            });
            return results;
        }
        if(object && name && (typeof name !== "string" || !name.includes("!"))) {
            var info = me.split(object, name, value);
            if(typeof info.value === "string" && info.value.startsWith("@")) {
                info.value = me.get(info.object, info.value.substring(1));
            }
            if(typeof info.name === "function") {
                result = info.name(info.object, info.value);
            }
            else {
                info.name = me.fullname(info.object, info.name);
                if(info.name) {
                    result = me.send(info.name + "." + method, info.object, info.value);
                }
            }
        }
        return result;
    };
    me.split = function(object, name, value) {
        if(typeof name === "string") {
            var valueSeparatorIdx = name.indexOf(":");
            if(valueSeparatorIdx !== -1) {
                args = name.substr(valueSeparatorIdx+1).split(",");
                name = name.substr(0, valueSeparatorIdx);
                if(args.length > 1) {
                    object = me.get(object, args[0]);
                    value = args[1];
                }
                else if(args.length === 1) {
                    value = args[0];
                }
            }
        }
        return {object:object,name:name,value:value};
    };
    me.forward = {
        get : function(object, property) {
            return {
                set: function (object, value) {
                    if (typeof value !== "undefined") {
                        me.link(property, value, true, object);
                    }
                }
            };
        }
    };
    me.link = function (source, target, enabled, object) {
        if(!object) {
            object=me;
        }
        if(object && object !== me) {
            source = me.core.property.fullname(object, source);
            target = me.core.property.fullname(object, target);
        }
        var forwarding_list = object._forwarding_list;
        if(!forwarding_list) {
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
    me.notify = function (object, name) {
        if(!object) {
            return;
        }
        if(!object.notifications) {
            object.notifications = {};
        }
        if(object.notifications[name]) {
            return;
        }
        object.notifications[name] = setTimeout(function() {
            object.notifications[name] = null;
            me.set(object, name);
        }, 0);
    };
    me.set = function (object, name, value) {
        if(!object) {
            return;
        }
        if (Array.isArray(object)) {
            var results = object.map(function (item) {
                return me.set(item, name, value);
            });
            return results;
        }
        if(typeof name !== "function") {
            var source_method = me.core.property.fullname(object, name);
            me.setTo(me._forwarding_list, object, source_method, value);
            me.setTo(object._forwarding_list, object, source_method, value);
        }
        me.setSingle(object, name, value);
    };
    me.setTo = function(list, object, name, value) {
        if(list) {
            var forwarding_list = list[name];
            if (forwarding_list) {
                for (var target in forwarding_list) {
                    var enabled = forwarding_list[target];
                    if(enabled) {
                        me.set(object, target, value);
                    }
                }
            }
        }
    };
    me.dirty = function(object, name) {
        me.get(object, name, "dirty");
    };
};
