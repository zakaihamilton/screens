/*
    @author Zakai Hamilton
    @component CoreObject
*/

package.core.object = function CoreObject(me) {
    me.create = function (component) {
        var object = {
            values:{},
            dirty:{},
            component:component.id
        };
        return object;
    };
    me.attach = function(data, component) {
        data.values = {};
        data.dirty = {};
        data.component = component.id;
        return data;
    };
    me.property = function (name, options=null) {
        return {
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
                        if(object.dirty && name in object.dirty) {
                            dirty = object.dirty[name];
                        }
                        if(dirty && callback) {
                            value = callback(object, name);
                            if(typeof value !== "undefined") {
                                dynamic = true;
                                object.values[name] = value;
                                object.dirty[name] = false;
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
                if(!dynamic && object.values && name in object.values) {
                    value = object.values[name];
                }
                return value;
            },
            set: function (object, value) {
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
                var oldValue = object.values[name];
                if(oldValue === value) {
                    object.dirty[name] = false;
                    return;
                }
                object.values[name] = value;
                object.dirty[name] = false;
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
                object.dirty[name] = true;
            }
        };
    };
};
