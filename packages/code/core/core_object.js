/*
    @author Zakai Hamilton
    @component CoreObject
*/

package.core.object = function CoreObject(me) {
    me.apply = function (component, object=null) {
        if(!object) {
            object = {};
        }
        object.values = {};
        object.dirty = {};
        object.component = component.id;
        return object;
    };
    me.attach = function(data, component) {
        
    };
    me.property = function (object, name, options=null) {
        var componentId = object.id || object.component;
        var fullName = componentId + "." + name;
        object[name] = {
            get: function (object) {
                var dirty = true;
                var value = null;
                var dynamic = false;
                if(!object) {
                    return null;
                }
                if(options) {
                    if("dirty" in options) {
                        var callback = options["dirty"];
                        if(object.dirty && fullName in object.dirty) {
                            dirty = object.dirty[fullName];
                        }
                        if(dirty && callback) {
                            value = callback(object, name);
                            if(typeof value !== "undefined") {
                                dynamic = true;
                                object.values[fullName] = value;
                                object.dirty[fullName] = false;
                            }
                        }
                    }
                    if(!dynamic && options && "get" in options) {
                        var callback = options["get"];
                        if(callback) {
                            value = callback(object, name);
                            if(typeof value !== "undefined") {
                                dynamic = true;
                            }
                        }
                    }
                }
                if(!dynamic && object.values && fullName in object.values) {
                    value = object.values[fullName];
                }
                console.log("get name: " + name + " value: " + value);
                return value;
            },
            set: function (object, value) {
                console.log("set name: " + name + " value: " + value);
                if(!object) {
                    return;
                }
                if(options && options.readOnly) {
                    return;
                }
                if(!object.values) {
                    object.values = {};
                }
                if(!object.dirty) {
                    object.dirty = {};
                }
                var oldValue = object.values[fullName];
                if(oldValue === value) {
                    object.dirty[fullName] = false;
                    return;
                }
                object.values[fullName] = value;
                object.dirty[fullName] = false;
                if(options && "set" in options) {
                    var callback = options["set"];
                    if(callback) {
                        callback(object, value, name, oldValue);
                    }
                }
            },
            dirty: function(object) {
                if(!object) {
                    return;
                }
                if(!object.values) {
                    object.dirty = {};
                }
                object.dirty[fullName] = true;
            }
        };
    };
};
