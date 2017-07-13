/*
 @author Zakai Hamilton
 @component UISet
 */

package.ui.set = function UISet(me) {
    me.toggle = function(options, key) {
        return {
            get: function (object) {
                return options[key];
            },
            set: function (object, value) {
                options[key] = !options[key];
            }
        };
    };
    me.attribute = function(attribute, callback) {
        return {
            get: function(object) {
                return object[attribute];
            },
            set: function(object, value) {
                object[attribute] = value;
                if(value) {
                    me.set(object, "ui.property.broadcast", {
                        "ui.theme.add": attribute
                    });
                }
                else {
                    me.set(object, "ui.property.broadcast", {
                        "ui.theme.remove": attribute
                    });
                }
                if(callback) {
                    callback(object, value);
                }
            }
        };
    };
};
