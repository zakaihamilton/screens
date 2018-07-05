/*
 @author Zakai Hamilton
 @component UIHtml
 */

screens.ui.html = function UIHtml(me) {
    me.init = function() {
        me.files = {};
    };
    me.icon = function(object, className) {
        return "<i class=\"" + className + "\"></i>";
    };
    me.loadComponent = async function(path, useCache=true) {
        var period = path.lastIndexOf(".");
        var component_name = path.substring(period + 1);
        var package_name = path.substring(0, period);
        var url = "/packages/code/" + package_name + "/" + package_name + "_" + component_name + ".html";
        var html = await me.loadFile(url, useCache);
        return html;
    };
    me.loadFile = async function(path, useCache=true) {
        if(useCache && path in me.files) {
            return me.files[path];
        }
        else {
            if(path && path.startsWith("/")) {
                path = path.substring(1);
            }
            var info = {
                method: "GET",
                url: "/" + path
            };
            var html = "";
            try {
                html = await me.core.http.send(info);
            }
            catch(err) {
                err = "Cannot load html file: " + path + " err: " + err.message || err;
                me.error(err);
            }
            if(useCache) {
                me.files[path] = html;
            }
            return html;
        }
    };
};
