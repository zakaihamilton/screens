/*
 @author Zakai Hamilton
 @component AppViewer
 */

package.app.viewer = function AppViewer(me) {
    me.launch = function (args) {
        var path = args[0];
        var json = __json__;
        var name = path;
        if(!name || name === ".") {
            name = "/";
        }
        else {
            name = name.replace("./", "/");
        }
        json.title = "Viewer - " + name;
        json["app.viewer.path"] = path;
        var viewer = me.the.ui.element.create(json, "workspace", "self");
        me.the.core.property.notify(viewer, "app.viewer.reload");
    };
    me.init = function () {
        me.path = me.the.core.object.property("app.viewer.path");
    };
    me.reload = {
        set: function(object) {
            var window = me.the.widget.window.window(object);
            var path = me.the.core.property.get(window, "app.viewer.path");
            me.the.core.file.readFile(function(err, data) {
                if(err) {
                    me.the.core.property.set(window.var.viewer, "ui.basic.text", err);
                }
                else {
                    me.the.core.property.set(window.var.viewer, "ui.basic.text", data);
                }
                me.the.core.property.notify(window, "update");
            }, path, 'utf8');
        }
    };
};
