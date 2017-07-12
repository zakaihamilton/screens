/*
 @author Zakai Hamilton
 @component CoreProperty
 */

package.core.property = function CoreProperty(me) {
    me.init = function() {
        package.get = me.get;
        package.set = me.set;
    };
    me.fullname = function(object, name, default_name=null) {
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
    me.get = function(object, name, method="get") {
        var result = undefined;
        if(object && name) {
            if(typeof name === "function") {
                result = name(object);
            }
            else {
                name = me.fullname(object, name);
                if(name) {
                    result = me.send(name + "." + method, object);
                }
            }
        }
        return result;
    };
    me.set = function(object, name, value=null, method="set") {
        var result = undefined;
        if(object && name) {
            if(typeof value === "string" && value.startsWith("@")) {
                value = me.get(object, value.substring(1));
            }
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
};
