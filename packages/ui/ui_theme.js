/*
 @author Zakai Hamilton
 @component UITheme
 */

package.ui.theme = function UITheme(me) {
    me.stylesheets = {};
    me.class = {
        set: function (object, value) {
            if(value) {
                me.set_class(object, value);
            }
        }
    };
    me.contains = {
        set: function(object, value) {
            if(value && object.classList) {
                var class_name = me.to_class(object, value);
                return object.classList.contains(class_name);
            }
            return false;
        }
    };
    me.add = {
        set: function(object, value) {
            if (Array.isArray(value)) {
                value.map(function (item) {
                    me.add.set(object, item);
                });
                return;
            }
            if(value && object.classList) {
                var class_name = me.to_class(object, value);
                object.classList.add(class_name);
            }
        }
    };
    me.remove = {
        set: function(object, value) {
            if (Array.isArray(value)) {
                value.map(function (item) {
                    me.remove.set(object, item);
                });
                return;
            }
            if(value && object.classList) {
                var class_name = me.to_class(object, value);
                object.classList.remove(class_name);
            }
        }
    };
    me.toggle = {
        set: function(object, value) {
            if (Array.isArray(value)) {
                value.map(function (item) {
                    me.toggle.set(object, item);
                });
                return;
            }
            if(value && object.classList) {
                var class_name = me.to_class(object, value);
                object.classList.toggle(class_name);
            }
        }
    };
    me.load_css = function (path) {
        var period = path.lastIndexOf(".");
        var component_name = path.substring(period + 1);
        var package_name = path.substring(0, period);
        var link = document.createElement("link");
        link.href = "/packages/" + package_name + "/" + package_name + "_" + component_name + ".css";
        link.type = "text/css";
        link.rel = "stylesheet";
        link.media = "screen,print";
        document.getElementsByTagName("head")[0].appendChild(link);
        console.log("Loaded css stylesheet: " + path + "=" + link.href);
        return link;
    };
    me.to_class = function (object, path) {
        path = path.replace("@component", object.component);
        path = path.replace(/[\.\_]/g, "-");
        return path;
    };
    me.to_component = function(object, path) {
        path = path.replace("@component", object.component);
        var tokens = path.split(".");
        if(tokens.length >= 2) {
            var package_name = tokens[0];
            var component_name = tokens[1];
            return package_name + "." + component_name;
        }
        return null;
    };
    me.set_class = function (object, path, add=false) {
        if (Array.isArray(path)) {
            object.className = "";
            path.map(function (item) {
                me.set_class(object, item, true);
            });
            return;
        }
        path = me.ui.element.to_full_name(object, path);
        var class_name = me.to_class(object, path);
        var component_name = me.to_component(object, path);
        if(component_name) {
            me.useStylesheet(component_name);
        }
        if(add || object.className === "") {
            object.className += " " + class_name;
        }
        else {
            object.className = class_name;
        }
    };
    me.useStylesheet = function(component_name) {
        if (!me.stylesheets[component_name]) {
            console.log("loading css stylesheet: " + component_name);
            me.stylesheets[component_name] = me.load_css(component_name);
        }
    };
};
