/*
 @author Zakai Hamilton
 @component UIClass
 */

screens.ui.class = function UIClass(me) {
    me.stylesheets = {};
    me.lookup = {
        get: function (object, value, property) {
            return me.core.property.get(object, "ui.class.contains", property);
        },
        set: function (object, value, property) {
            if (value) {
                me.core.property.set(object, "ui.class.add", property);
            }
            else {
                me.core.property.set(object, "ui.class.remove", property);
            }
        }
    };
    me.processClass = function (object, classList, callback) {
        if (Array.isArray(classList)) {
            classList = classList.join(" ");
            classList = classList.replace(/,/g, " ");
        }
        if (classList && object.classList) {
            classList = classList.split(" ").map(function (className) {
                return me.to_class(object, className);
            }).join(" ");
            classList.split(" ").map(function (className) {
                if (className) {
                    callback(className);
                }
            });
        }
    };
    me.class = {
        set: function (object, value) {
            me.set_class(object, value);
        }
    };
    me.classExtra = {
        set: function (object, value) {
            me.set_class(object, value, true);
        }
    };
    me.contains = {
        get: function (object, value) {
            var containCount = 0, itemCount = 0;
            me.processClass(object, value, function (item) {
                if (object.classList.contains(item)) {
                    containCount++;
                }
                itemCount++;
            });
            return containCount && containCount === itemCount;
        }
    };
    me.add = {
        set: function (object, value) {
            me.processClass(object, value, function (item) {
                object.classList.add(item);
            });
        }
    };
    me.remove = {
        set: function (object, value) {
            me.processClass(object, value, function (item) {
                object.classList.remove(item);
            });
        }
    };
    me.toggle = {
        set: function (object, value) {
            me.processClass(object, value, function (item) {
                object.classList.toggle(item);
            });
        }
    };
    me.to_class = function (object, path) {
        path = path.replace("@component", object.component);
        if (path.startsWith(".")) {
            path = path.substr(1);
        }
        path = path.replace(/[\.\_]/g, "-");
        return path;
    };
    me.to_package = function (object, path) {
        path = path.replace("@component", object.component);
        var tokens = path.split(".");
        if (tokens.length >= 2) {
            return tokens[0];
        }
        return null;
    };
    me.set_class = function (object, path, add = false) {
        if (!add) {
            object.className = "";
        }
        if (Array.isArray(path)) {
            path.map(function (item) {
                me.set_class(object, item, true);
            });
            return;
        }
        var class_name = "";
        if (typeof path === "string" && path.startsWith(".")) {
            class_name = path.substr(1);
        }
        else {
            if (path) {
                path = me.core.property.to_full_name(object, path);
                class_name = me.to_class(object, path);
            }
            var nightMode = me.ui.theme.options.nightMode;
            if (nightMode) {
                class_name += " night-mode is-dark";
            }
        }
        me.processClass(object, class_name, function (item) {
            object.classList.add(item);
        });
    };
};
