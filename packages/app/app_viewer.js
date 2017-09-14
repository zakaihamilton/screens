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
        var viewer = me.ui.element.create(json, "desktop", "self");
        me.notify(viewer, "app.viewer.reload");
    };
    me.init = function () {
        me.path = me.core.object.property("app.viewer.path");
    };
    me.reload = {
        set: function(object) {
            var window = me.widget.window.window(object);
            var path = me.get(window, "app.viewer.path");
            me.core.file.readFile(function(err, data) {
                if(err) {
                    me.set(window.var.viewer, "ui.basic.text", err);
                }
                else {
                    me.set(window.var.viewer, "ui.basic.text", data);
                }
                me.notify(window, "update");
            }, path, 'utf8');
        }
    };
};
