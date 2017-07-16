/*
    @author Zakai Hamilton
    @component CoreObject
*/

package.core.object = function CoreObject(me) {
    me.create = function () {
        var object = {values:{},dirty:{}};
        return object;
    };
    me.property = function (name, callbacks=null) {
        return {
            get: function (object) {
                var dirty = true;
                var value = null;
                var dynamic = false;
                if(!object) {
                    return null;
                }
                if(callbacks) {
                    if("dirty" in callbacks) {
                        var callback = callbacks["dirty"];
                        if(object.dirty && name in object.dirty) {
                            dirty = object.dirty[name];
                        }
                        if(dirty && callback) {
                            value = callback(object, name);
                            if(typeof value !== "undefined") {
                                dynamic = true;
                            }
                        }
                    }
                    if(!dynamic && callbacks && "get" in callbacks) {
                        var callback = callbacks["get"];
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
                if(!object.values) {
                    object.values = {};
                }
                if(!object.dirty) {
                    object.dirty = {};
                }
                object.values[name] = value;
                object.dirty[name] = false;
                if(callbacks && "set" in callbacks) {
                    var callback = callbacks["set"];
                    if(callback) {
                        callback(object, name, value);
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
