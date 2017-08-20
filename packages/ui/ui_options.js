/*
 @author Zakai Hamilton
 @component UIOptions
 */

package.ui.options = function UIOptions(me) {
    me.load = function(component, object, defaults, storage="local") {
        var storageKey = component.id + ".options";
        if(object) {
            storageKey += "." + me.get(object, "key");
        }
        var validKey = me.storage.cache.validKey(storageKey);
        var value = me.get(me.storage.cache[storage], validKey);
        var options = Object.assign({}, defaults, JSON.parse(value));
        if(object) {
            object.options = options;
        }
        else {
            component.options = options;
        }
    };
    me.toggleSet = function (component, key, callback, storage="local") {
        if(!component.options) {
            component.options = {};
        }
        return {
            get: function (object) {
                var options = component.options;
                var window = me.get(object, "widget.window.active");
                if(window && window.options) {
                    options = window.options;
                }
                return options[key];
            },
            set: function (object, value) {
                var options = component.options;
                var window = me.get(object, "widget.window.active");
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
                        storageKey += "." + me.get(object, "key");
                    }
                    var validKey = me.storage.cache.validKey(storageKey);
                    me.set(me.storage.cache[storage], validKey, JSON.stringify(options));
                }
            }
        };
    };
    me.choiceSet = function (component, key, callback, storage="local") {
        if(!component.options) {
            component.options = {};
        }
        var methods = {
            get: function (object, value) {
                var options = component.options;
                var window = me.get(object, "widget.window.active");
                if(window && window.options) {
                    options = window.options;
                }
                return options[key] === value;
            },
            set: function (object, value) {
                var options = component.options;
                var window = me.get(object, "widget.window.active");
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
                        storageKey += "." + me.get(object, "key");
                    }
                    var validKey = me.storage.cache.validKey(storageKey);
                    me.set(me.storage.cache[storage], validKey, JSON.stringify(options));
                }
            }
        };
        return methods;
    };
};
