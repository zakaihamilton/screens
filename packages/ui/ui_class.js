/*
 @author Zakai Hamilton
 @component UIClass
 */

package.ui.class = function UIClass(me) {
    me.stylesheets = {};
    me.processClass = function(object, classList, callback) {
        if (Array.isArray(classList)) {
            classList = classList.join(" ");
        }
        if(classList && object.classList) {
            classList = classList.split(" ").map(function(className) {
                return me.to_class(object, className);
            }).join(" ");
            classList.split(" ").map(function(className) {
                callback(className);
            });
        }
    };
    me.class = {
        set: function (object, value) {
            if(value) {
                me.set_class(object, value);
            }
        }
    };
    me.contains = {
        get: function(object, value) {
            var containCount = 0, itemCount = 0;
            me.processClass(object, value, function(item) {
                if(object.classList.contains(item)) {
                    containCount++;
                }
                itemCount++;
            });
            return containCount && containCount === itemCount;
        }
    };
    me.add = {
        set: function(object, value) {
            me.processClass(object, value, function(item) {
                object.classList.add(item);
            });
        }
    };
    me.remove = {
        set: function(object, value) {
            me.processClass(object, value, function(item) {
                object.classList.remove(item);
            });
        }
    };
    me.toggle = {
        set: function(object, value) {
            me.processClass(object, value, function(item) {
                object.classList.toggle(item);
            });
        }
    };
    me.loadStylesheet = function(path) {
        var link = document.createElement("link");
        link.href = path;
        link.type = "text/css";
        link.rel = "stylesheet";
        link.media = "screen,print";
        document.getElementsByTagName("head")[0].appendChild(link);
        console.log("Loaded css stylesheet: " + path + "=" + link.href);
        return link;
    };
    me.loadComponentStylesheet = function (path) {
        var period = path.lastIndexOf(".");
        var component_name = path.substring(period + 1);
        var package_name = path.substring(0, period);
        var fullPath = "/packages/" + package_name + "/" + package_name + "_" + component_name + ".css";
        return me.loadStylesheet(fullPath);
    };
    me.to_class = function (object, path) {
        path = path.replace("@component", object.component);
        path = path.replace(/[\.\_]/g, "-");
        path = me.the.ui.theme.getMapping(path);
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
        if(!add) {
            object.className = "";
        }
        if (Array.isArray(path)) {
            path.map(function (item) {
                me.set_class(object, item, true);
            });
            return;
        }
        path = me.the.ui.element.to_full_name(object, path);
        var class_name = me.to_class(object, path);
        var component_name = me.to_component(object, path);
        if(component_name) {
            me.useStylesheet(component_name);
        }
        me.processClass(object, class_name, function(item) {
            object.classList.add(item);
        });
    };
    me.useStylesheet = function(component_name) {
        if (!me.stylesheets[component_name]) {
            console.log("loading css stylesheet: " + component_name);
            me.stylesheets[component_name] = me.loadComponentStylesheet(component_name);
        }
    };
};
