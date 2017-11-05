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
        var viewer = me.package.ui.element.create(json, "workspace", "self");
        me.package.core.property.notify(viewer, "app.viewer.reload");
    };
    me.init = function () {
        me.path = me.package.core.object.property("app.viewer.path");
    };
    me.reload = {
        set: function(object) {
            var window = me.package.widget.window.window(object);
            var path = me.package.core.property.get(window, "app.viewer.path");
            me.package.core.file.readFile(function(err, data) {
                if(err) {
                    me.package.core.property.set(window.var.viewer, "ui.basic.text", err);
                }
                else {
                    me.package.core.property.set(window.var.viewer, "ui.basic.text", data);
                }
                me.package.core.property.notify(window, "update");
            }, path, 'utf8');
        }
    };
};
