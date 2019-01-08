/*
 @author Zakai Hamilton
 @component UIHtml
 */

screens.ui.html = function UIHtml(me) {
    me.init = function () {
        me.files = {};
    };
    me.icon = function (object, className) {
        return "<i class=\"" + className + "\"></i>";
    };
    me.item = function (info, members) {
        var tag = info.tag;
        if (!tag) {
            tag = "div";
        }
        var html = "<" + tag;
        if (info.classes && info.classes.length) {
            html += " class=\"" + info.classes.join(" ") + "\"";
        }
        if (info.styles && Object.keys(info.styles).length) {
            html += " style=\"";
            for (let name in info.styles) {
                html += name + ":" + info.styles[name] + ";";
            }
            html += "\"";
        }
        if (info.attributes && Object.keys(info.attributes).length) {
            for (let name in info.attributes) {
                html += " " + name + "=\"" + info.attributes[name] + "\"";
            }
        }
        html += ">";
        if (info.value) {
            html += info.value;
        }
        if (members) {
            var result = members();
            if (result) {
                html += result;
            }
        }
        html += "</" + tag + ">";
        return html;
    };
    me.loadComponent = async function (path, useCache = true) {
        var period = path.lastIndexOf(".");
        var component_name = path.substring(period + 1);
        var package_name = path.substring(0, period);
        var url = "/packages/code/" + package_name + "/" + package_name + "_" + component_name + ".html";
        var html = await me.loadFile(url, useCache);
        return html;
    };
    me.loadFile = async function (path, useCache = true) {
        if (useCache && path in me.files) {
            return me.files[path];
        }
        else {
            if (path && path.startsWith("/")) {
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
            catch (err) {
                err = "Cannot load html file: " + path + " err: " + err.message || err;
                me.log_error(err);
            }
            if (useCache) {
                me.files[path] = html;
            }
            return html;
        }
    };
};
