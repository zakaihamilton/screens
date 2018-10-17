/*
    @author Zakai Hamilton
    @component CoreObject
*/

screens.core.object = function CoreObject(me) {
    me.proxy.apply = function (component, object = null) {
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
