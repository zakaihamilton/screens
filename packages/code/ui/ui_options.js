/*
 @author Zakai Hamilton
 @component UIOptions
 */

package.ui.options = function UIOptions(me) {
    me.getStorage = function(component, object) {
        var storage = "local";
        if(object && object.storageName) {
            storage = object.storageName;
        }
        else if(component && component.storageName) {
            storage = component.storageName;
        }
        return storage;
    };
    me.setStorage = function(component, object, storage) {
        if(object) {
            object.storageName = storage;
        }
        if(component) {
            component.storageName = storage;
        }
    };
    me.load = function(component, object, defaults) {
        var storage = me.getStorage(component, object);
        var storageKey = component.id + ".options";
        if(object) {
            storageKey += "." + me.core.property.get(object, "key");
        }
        var validKey = me.storage.local.validKey(storageKey);
        var value = me.core.property.get(me.storage.local[storage], validKey);
        var options = Object.assign({}, defaults, value ? JSON.parse(value) : {});
        if(object) {
            object.options = options;
        }
        else {
            component.options = options;
        }
    };
    me.toggleSet = function (component, key, callback) {
        if(!component.options) {
            component.options = {};
        }
        component[key] = {
            get: function (object) {
                var options = component.options;
                var window = me.core.property.get(object, "widget.window.active");
                if(window && window.options) {
                    options = window.options;
                }
                return options[key];
            },
            set: function (object, value) {
                var storage = me.getStorage(component, object);
                var options = component.options;
                var window = me.core.property.get(object, "widget.window.active");
                if(window && window.options) {
                    options = window.options;
                }
                options[key] = !options[key];
                if(callback) {
                    callback(object, options, key, options[key]);
                }
                if(storage) {
                    var storageKey = component.id + ".options";
                    if(object && object.options) {
                        storageKey += "." + me.core.property.get(object, "key");
                    }
                    var validKey = me.storage.local.validKey(storageKey);
                    me.core.property.set(me.storage.local[storage], validKey, JSON.stringify(options));
                }
            }
        };
    };
    me.choiceSet = function (component, key, callback) {
        if(!component.options) {
            component.options = {};
        }
        component[key] = {
            get: function (object, value) {
                var options = component.options;
                var window = me.core.property.get(object, "widget.window.active");
                if(window && window.options) {
                    options = window.options;
                }
                return options[key] === value;
            },
            set: function (object, value) {
                var storage = me.getStorage(component, object);
                var options = component.options;
                var window = me.core.property.get(object, "widget.window.active");
                if(window && window.options) {
                    options = window.options;
                }
                options[key] = value;
                if(callback) {
                    callback(object, options, key, options[key]);
                }
                if(storage) {
                    var storageKey = component.id + ".options";
                    if(object && object.options) {
                        storageKey += "." + me.core.property.get(object, "key");
                    }
                    var validKey = me.storage.local.validKey(storageKey);
                    me.core.property.set(me.storage.local[storage], validKey, JSON.stringify(options));
                }
            }
        };
    };
    me.inputSet = function (component, key, callback) {
        if(!component.options) {
            component.options = {};
        }
        component[key] = {
            get: function (object) {
                var options = component.options;
                var window = me.core.property.get(object, "widget.window.active");
                if(window && window.options) {
                    options = window.options;
                }
                return options[key];
            },
            set: function (object, value) {
                var storage = me.getStorage(component, object);
                var options = component.options;
                var window = me.core.property.get(object, "widget.window.active");
                if(window && window.options) {
                    options = window.options;
                }
                var text = me.core.property.get(window.var[key], "ui.basic.text");
                if(typeof value === "string" || typeof value === "number") {
                    if(text !== value) {
                        me.core.property.set(window.var[key], "ui.basic.text", value);
                    }
                }
                else {
                    value = text;
                }
                options[key] = value;
                if(callback) {
                    callback(object, options, key, options[key]);
                }
                if(storage) {
                    var storageKey = component.id + ".options";
                    if(object && object.options) {
                        storageKey += "." + me.core.property.get(object, "key");
                    }
                    var validKey = me.storage.local.validKey(storageKey);
                    me.core.property.set(me.storage.local[storage], validKey, JSON.stringify(options));
                }
            }
        };
    };
};
