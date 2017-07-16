/*
 @author Zakai Hamilton
 @component UISet
 */

package.ui.set = function UISet(me) {
    me.toggleOption = function (options, key) {
        return {
            get: function (object) {
                return options[key];
            },
            set: function (object, value) {
                options[key] = !options[key];
            }
        };
    };
    me.themedProperty = function (name, callback) {
        return me.core.object.property(name, {
            "set": function (object, name, value) {
                if (value) {
                    me.set(object, "ui.property.broadcast", {
                        "ui.theme.add": name
                    });
                } else {
                    me.set(object, "ui.property.broadcast", {
                        "ui.theme.remove": name
                    });
                }
                if (callback) {
                    callback(object, name, value);
                }
            }
        });
    };
};
