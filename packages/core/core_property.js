/*
 @author Zakai Hamilton
 @component CoreProperty
 */

package.core.property = function CoreProperty(me) {
    me.init = function() {
        package.get = me.get;
        package.set = me.set;
    };
    me.fullname = function(object, name) {
        var separator = name.indexOf(".");
        var package_name = null;
        if(separator !== -1) {
            package_name = name.substr(0, separator);
        }
        if(!package_name || !(package_name in package)) {
            if(!object.component) {
                return null;
            }
            name = object.component + "." + name;
        }
        if(object.component) {
            var alias = package[object.component].alias;
            if(alias) {
                if(name in alias) {
                    name = alias[name];
                }
            }
        }
        return name;
    };
    me.get = function(object, name) {
        var result = undefined;
        if(object && name) {
            name = me.fullname(object, name);
            if(name) {
                result = me.send(name + ".get", object);
            }
        }
        return result;
    };
    me.set = function(object, name, value) {
        var result = undefined;
        if(object && name) {
            name = me.fullname(object, name);
            if(name) {
                result = me.send(name + ".set", object, value);
            }
        }
        return result;
    };
};
