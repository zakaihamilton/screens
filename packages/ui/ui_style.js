/*
 @author Zakai Hamilton
 @component UIStyle
 */

package.ui.style = function UIStyle(me) {
    me.platform = "browser";
    me.set = function (object, method, value) {
        if(typeof value !== "undefined") {
            if(method === "class") {
                me.add_class(object, value);
            }
            else {
                object.style[method] = value;
            }
        }
    };
    me.get = function (object, method) {
        if (method in object.style) {
            return object.style[method];
        }
    };
    me.load_css = function (path) {
        var period = path.lastIndexOf(".");
        var component_name = path.substring(period+1);
        var package_name = path.substring(0, period);
        var link = document.createElement("link");
        link.href = "/packages/" + package_name + "/" + package_name + "_" + component_name + ".css";
        link.type = "text/css";
        link.rel = "stylesheet";
        link.media = "screen,print";
        document.getElementsByTagName("head")[0].appendChild(link);
        console.log(path + "=" + link.href);
    };
    me.to_class = function(path) {
        path = path.replace(/[\.\_]/g, "-");
        return path;
    };
    me.add_class = function (object, path) {
        var class_name = me.to_class(path);
        var component_name = path.substring(0, path.lastIndexOf("."));
        if (!package[component_name].css) {
            package[component_name].css = me.load_css(component_name);
        }
        console.log("path: " + path + " style: " + class_name);
        object.classList.add(class_name);
    };
};
