/*
 @author Zakai Hamilton
 @component AppViewer
 */

screens.app.viewer = function AppViewer(me) {
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
        var viewer = me.ui.element(json, "workspace", "self");
        me.core.property.notify(viewer, "app.viewer.reload");
        return me.singleton;
    };
    me.init = function () {
        me.core.property.set(me, {
            "core.object.path":null
        });
    };
    me.reload = {
        set: async function(object) {
            var window = me.widget.window(object);
            var path = me.core.property.get(window, "app.viewer.path");
            var data = await me.core.file.readFile(path, 'utf8');
            me.core.property.set(window.var.viewer, "ui.basic.text", data);
            me.core.property.notify(window, "update");
        }
    };
};
