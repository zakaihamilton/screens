/*
 @author Zakai Hamilton
 @component UIOptions
 */

screens.ui.options = function UIOptions(me, { core, storage }) {
    me.getStorageType = function (component, object) {
        var storage = "local";
        if (object && object.storageName) {
            storage = object.storageName;
        }
        else if (component && component.storageName) {
            storage = component.storageName;
        }
        return storage;
    };
    me.setStorage = function (component, object, storage) {
        if (object) {
            object.storageName = storage;
        }
        if (component) {
            component.storageName = storage;
        }
    };
    me.storageKey = function (component) {
        var storageKey = component.id + ".options";
        var validKey = storage.local.validKey(storageKey);
        return validKey;
    };
    me.load = function (component, object, defaults) {
        var value = storage.local.get(me.storageKey(component, object));
        var options = component.options;
        if (object) {
            options = object.options;
        }
        options = Object.assign({}, options, defaults, value ? JSON.parse(value) : {});
        if (object) {
            object.options = options;
        }
        else {
            component.options = options;
        }
    };
    me.save = function (component, object, options) {
        var allOptions = null;
        if (object) {
            allOptions = object.options;
        }
        else {
            allOptions = component.options;
        }
        allOptions = Object.assign({}, allOptions, options);
        if (object) {
            object.options = allOptions;
        }
        else {
            component.options = allOptions;
        }
        storage.local.set(me.storageKey(component, object), JSON.stringify(allOptions));
    };
    me.toggleSet = function (component, toTargetCallback, key, callback) {
        if (typeof key === "object") {
            for (var property in key) {
                callback = key[property];
                me.toggleSet(component, toTargetCallback, property, callback);
            }
            return;
        }
        if (!component.options) {
            component.options = {};
        }
        component[key] = {
            get: function (object) {
                if (toTargetCallback) {
                    if (component === toTargetCallback) {
                        object = component;
                    }
                    else {
                        object = toTargetCallback(object);
                    }
                }
                var options = component.options;
                if (object && object.options) {
                    options = object.options;
                }
                return options[key];
            },
            set: function (object) {
                if (toTargetCallback) {
                    if (component === toTargetCallback) {
                        object = component;
                    }
                    else {
                        object = toTargetCallback(object);
                    }
                }
                var storageType = me.getStorageType(component, object);
                var options = component.options;
                if (object && object.options) {
                    options = object.options;
                }
                options[key] = !options[key];
                if (callback) {
                    core.message.send(callback, object, options[key], key, options);
                }
                if (storageType) {
                    storage.local.set(me.storageKey(component, object), JSON.stringify(options));
                }
            }
        };
    };
    me.choiceSet = function (component, toTargetCallback, key, callback) {
        if (typeof key === "object") {
            for (var property in key) {
                callback = key[property];
                me.choiceSet(component, toTargetCallback, property, callback);
            }
            return;
        }
        if (!component.options) {
            component.options = {};
        }
        component[key] = {
            get: function (object, value) {
                if (toTargetCallback) {
                    if (component === toTargetCallback) {
                        object = component;
                    }
                    else {
                        object = toTargetCallback(object);
                    }
                }
                var options = component.options;
                if (object && object.options) {
                    options = object.options;
                }
                return options[key] === value;
            },
            set: function (object, value) {
                if (toTargetCallback) {
                    if (component === toTargetCallback) {
                        object = component;
                    }
                    else {
                        object = toTargetCallback(object);
                    }
                }
                var storageType = me.getStorageType(component, object);
                var options = component.options;
                if (object && object.options) {
                    options = object.options;
                }
                options[key] = value;
                if (callback) {
                    core.message.send(callback, object, options[key], key, options);
                }
                if (storageType) {
                    storage.local.set(me.storageKey(component, object), JSON.stringify(options));
                }
            }
        };
    };
    me.listSet = function (component, toTargetCallback, key, callback) {
        if (typeof key === "object") {
            for (var property in key) {
                callback = key[property];
                me.listSet(component, toTargetCallback, property, callback);
            }
            return;
        }
        if (!component.options) {
            component.options = {};
        }
        component[key] = {
            get: function (object) {
                if (toTargetCallback) {
                    if (component === toTargetCallback) {
                        object = component;
                    }
                    else {
                        object = toTargetCallback(object);
                    }
                }
                var options = component.options;
                if (object && object.options) {
                    options = object.options;
                }
                return options[key];
            },
            set: function (object, value) {
                if (toTargetCallback) {
                    if (component === toTargetCallback) {
                        object = component;
                    }
                    else {
                        object = toTargetCallback(object);
                    }
                }
                var storageType = me.getStorageType(component, object);
                var options = component.options;
                if (object && object.options) {
                    options = object.options;
                }
                if (options[key] == value) {
                    return;
                }
                options[key] = value;
                if (callback) {
                    core.message.send(callback, object, options[key], key, options);
                }
                if (storageType) {
                    storage.local.set(me.storageKey(component, object), JSON.stringify(options));
                }
            }
        };
    };
};
