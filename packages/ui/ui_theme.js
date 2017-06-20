/*
 @author Zakai Hamilton
 @component UITheme
 */

package.ui.theme = function UITheme(me) {
    me.require = {platform: "browser"};
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
                var class_name = me.to_class(value);
                return object.classList.contains(class_name);
            }
        }
    };
    me.add = {
        set: function(object, value) {
            if(value && object.classList) {
                var class_name = me.to_class(value);
                object.classList.add(class_name);
            }
        }
    };
    me.remove = {
        set: function(object, value) {
            if(value && object.classList) {
                var class_name = me.to_class(value);
                object.classList.remove(class_name);
            }
        }
    };
    me.toggle = {
        set: function(object, value) {
            if(value && object.classList) {
                var class_name = me.to_class(value);
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
        console.log("Loaded css: " + path + "=" + link.href);
        return link;
    };
    me.to_class = function (path) {
        path = path.replace(/[\.\_]/g, "-");
        return path;
    };
    me.set_class = function (object, path, add=false) {
        if (Array.isArray(path)) {
            object.className = "";
            path.map(function (item) {
                me.set_class(object, item, true);
            });
            return;
        }
        var class_name = me.to_class(path);
        var component_name = path.substring(0, path.lastIndexOf("."));
        if (!me.stylesheets[component_name]) {
            console.log("loading css stylesheet: " + component_name);
            me.stylesheets[component_name] = me.load_css(component_name);
        }
        if(add || object.className === "") {
            object.className += " " + class_name;
        }
        else {
            object.className = class_name;
        }
    };
    me.dynamic = {
        get: function(object) {
            return object.dynamic_class;
        },
        set: function(object, value) {
            value = me.ui.element.get_value(object, value);
            if(typeof value !== "undefined") {
                object.dynamic_class = value;
            }
        }
    };
    me.change_class = function(object, from, to, property_to_stop) {
        if(object.dynamic_class) {
            if(from) {
                me.ui.element.set(object, "ui.theme.remove", from);
            }
            if(to) {
                me.ui.element.set(object, "ui.theme.add", to);
            }
        }
        for(var index = 0; index < object.childNodes.length; index++) {
            var child = object.childNodes[index];
            if(child[property_to_stop]) {
                continue;
            }
            me.change_class(child, from, to, property_to_stop);
        }
    };
};
