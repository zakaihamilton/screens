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
        var package_name = name.substr(0, name.indexOf("."));
        if(!(package_name in package)) {
            if(!object.component) {
                return undefined;
            }
            name = object.component + "." + name;
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
            result = me.send(name + ".set", object, value);
        }
        return result;
    };
};
