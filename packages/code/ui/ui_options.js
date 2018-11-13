/*
 @author Zakai Hamilton
 @component UIOptions
 */

screens.ui.options = function UIOptions(me) {
    me.getStorage = function (component, object) {
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
    me.storageKey = function(component, object) {
        var storageKey = component.id + ".options";
        if (object) {
            var window = me.widget.window.get(object);
            var key = me.core.property.get(window, "key");
            if(key) {
                storageKey = key + "." + storageKey;
            }
        }
        var validKey = me.storage.local.validKey(storageKey);
        return validKey;
    };
    me.load = function (component, object, defaults) {
        var storage = me.getStorage(component, object);
        var window = null;
        var value = me.core.property.get(me.storage.local[storage], me.storageKey(component, object));
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
    me.save = function(component, object, options) {
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
        var storage = me.getStorage(component, object);
        me.core.property.set(me.storage.local[storage], me.storageKey(component, object), JSON.stringify(allOptions));
    };
    me.toggleSet = function (component, toTargetCallback, key, callback) {
        if(typeof key === "object") {
            for(var property in key) {
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
                    if(component === toTargetCallback) {
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
                    if(component === toTargetCallback) {
                        object = component;
                    }
                    else {
                        object = toTargetCallback(object);
                    }
                }
                var storage = me.getStorage(component, object);
                var options = component.options;
                if (object && object.options) {
                    options = object.options;
                }
                options[key] = !options[key];
                if (callback) {
                    callback(object, options[key], key, options);
                }
                if (storage) {
                    me.core.property.set(me.storage.local[storage], me.storageKey(component, object), JSON.stringify(options));
                }
            }
        };
    };
    me.choiceSet = function (component, toTargetCallback, key, callback) {
        if(typeof key === "object") {
            for(var property in key) {
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
                    if(component === toTargetCallback) {
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
                    if(component === toTargetCallback) {
                        object = component;
                    }
                    else {
                        object = toTargetCallback(object);
                    }
                }
                var storage = me.getStorage(component, object);
                var options = component.options;
                if (object && object.options) {
                    options = object.options;
                }
                options[key] = value;
                if (callback) {
                    callback(object, options[key], key, options);
                }
                if (storage) {
                    me.core.property.set(me.storage.local[storage], me.storageKey(component, object), JSON.stringify(options));
                }
            }
        };
    };
    me.listSet = function (component, toTargetCallback, key, callback) {
        if(typeof key === "object") {
            for(var property in key) {
                callback = key[property];
                me.listSet(component, toTargetCallback, property, callback);
            }
            return;
        }
        if (!component.options) {
            component.options = {};
        }
        component[key] = {
            get: function (object, value) {
                if (toTargetCallback) {
                    if(component === toTargetCallback) {
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
                    if(component === toTargetCallback) {
                        object = component;
                    }
                    else {
                        object = toTargetCallback(object);
                    }
                }
                var storage = me.getStorage(component, object);
                var options = component.options;
                if (object && object.options) {
                    options = object.options;
                }
                options[key] = value;
                if (callback) {
                    callback(object, options[key], key, options);
                }
                if (storage) {
                    me.core.property.set(me.storage.local[storage], me.storageKey(component, object), JSON.stringify(options));
                }
            }
        };
    };
};
