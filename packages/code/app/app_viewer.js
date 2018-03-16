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
        var viewer = me.ui.element.create(json, "workspace", "self");
        me.core.property.notify(viewer, "app.viewer.reload");
        return me.singleton;
    };
    me.init = function () {
        me.core.object.property(me, "path");
    };
    me.reload = {
        set: function(object) {
            var window = me.widget.window(object);
            var path = me.core.property.get(window, "app.viewer.path");
            me.core.file.readFile(function(err, data) {
                me.core.property.set(window.var.viewer, "ui.basic.text", err ? err : data);
                me.core.property.notify(window, "update");
            }, path, 'utf8');
        }
    };
};
