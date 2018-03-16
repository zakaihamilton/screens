/*
    @author Zakai Hamilton
    @component CoreObject
*/

package.core.object = function CoreObject(me) {
    me.apply = function (component, object = null) {
        if (!object) {
            object = {};
        }
        object.values = {};
        object.dirty = {};
        object.component = component.id;
        return object;
    };
    me.get = function (object, property) {
        return {
            set: function (object, info) {
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
                        console.log("set property: " + property + " value: " + value);
                        if (!object) {
                            return;
                        }
                        if (info && info.readOnly) {
                            return;
                        }
                        if (!object.values) {
                            object.values = {};
                        }
                        if (!object.dirty) {
                            object.dirty = {};
                        }
                        var oldValue = object.values[name];
                        if (oldValue === value) {
                            object.dirty[name] = false;
                            return;
                        }
                        object.values[name] = value;
                        object.dirty[name] = false;
                        if (info && "set" in info) {
                            var callback = info["set"];
                            if (callback) {
                                callback(object, value, property, oldValue);
                            }
                        }
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
        }
    };
};
