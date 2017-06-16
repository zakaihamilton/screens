/*
 @author Zakai Hamilton
 @component UIStyle
 */

package.ui.style = function UIStyle(me) {
    me.require = {platform: "browser"};
    me.stylesheets = {};
    me.forward = {
        get : function(object, property) {
            return {
                get: function (object) {
                    return getComputedStyle(object)[property];
                },
                set: function (object, value) {
                    if (object && typeof value !== "undefined") {
                        if (property === "class") {
                            me.set_class(object, value);
                        } else {
                            object.style[property] = value;
                        }
                    }
                }
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
            console.log("loading: " + component_name);
            me.stylesheets[component_name] = me.load_css(component_name);
        }
        console.log("path: " + path + " style: " + class_name);
        if(add || object.className === "") {
            object.className += " " + class_name;
        }
        else {
            object.className = class_name;
        }
    };
    me.has_class = function (object, path) {
        var class_name = me.to_class(path);
        return object.classList.contains(class_name);
    };
};
