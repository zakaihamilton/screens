/*
 @author Zakai Hamilton
 @component UIClass
 */

package.ui.class = function UIClass(me) {
    me.stylesheets = {};
    me.styleSheetsLeftToLoad = 0;
    me.processClass = function(object, classList, callback) {
        if (Array.isArray(classList)) {
            classList = classList.join(" ");
            classList = classList.replace(/,/g, " ");
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
    me.loadStylesheet = function(callback, path) {
        var link = document.createElement("link");
        link.href = path;
        link.type = "text/css";
        link.rel = "stylesheet";
        link.media = "screen,print";
        link.onload = function() {
            me.core.console.log("Loaded css stylesheet: " + path + "=" + link.href);
            if(callback) {
                callback();
            }
        };
        me.styleSheetsLeftToLoad++;
        document.getElementsByTagName("head")[0].appendChild(link);
        me.core.console.log("Loading css stylesheet: " + path + "=" + link.href);
        return link;
    };
    me.loadPackageStylesheets = function (callback, package_name) {
        var fullPath = "/packages/code/" + package_name + "/" + package_name + "_*.css";
        return me.loadStylesheet(callback, fullPath);
    };
    me.to_class = function (object, path) {
        path = path.replace("@component", object.component);
        if(path.startsWith(".")) {
            path = path.substr(1);
        }
        path = path.replace(/[\.\_]/g, "-");
        path = me.ui.theme.getMapping(path);
        return path;
    };
    me.to_package = function(object, path) {
        path = path.replace("@component", object.component);
        var tokens = path.split(".");
        if(tokens.length >= 2) {
            return tokens[0];
        }
        return null;
    };
    me.set_class = function (object, path, add=false) {
        if(!path) {
            return;
        }
        if(!add) {
            object.className = "";
        }
        if (Array.isArray(path)) {
            path.map(function (item) {
                me.set_class(object, item, true);
            });
            return;
        }
        if(typeof path === "string" && path.startsWith(".")) {
            class_name = path.substr(1);
        }
        else {
            path = me.core.property.to_full_name(object, path);
            var class_name = me.to_class(object, path);
            var package_name = me.to_package(object, path);
            if(package_name) {
                me.useStylesheet(null, package_name);
            }
        }
        me.processClass(object, class_name, function(item) {
            object.classList.add(item);
        });
    };
    me.useStylesheet = function(callback, package_name) {
        if (!me.stylesheets[package_name]) {
            me.core.console.log("loading css stylesheets for package: " + package_name);
            me.stylesheets[package_name] = me.loadPackageStylesheets(callback, package_name);
        }
        else if(callback) {
            callback();
        }
    };
};
