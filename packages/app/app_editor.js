/*
 @author Zakai Hamilton
 @component AppEditor
 */

package.app.editor = function AppEditor(me) {
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
        json.title = "Editor - " + name;
        json["app.editor.path"] = path;
        var editor = me.ui.element.create(json, "desktop", "self");
        me.notify(editor, "app.editor.reload");
    };
    me.init = function () {
        me.path = me.core.object.property("app.editor.path");
    };
    me.reload = {
        set: function(object) {
            var window = me.widget.window.window(object);
            var path = me.get(window, "app.editor.path");
            me.core.file.readFile(function(err, data) {
                if(err) {
                    me.set(window.var.editor, "ui.basic.text", err);
                }
                else {
                    me.set(window.var.editor, "ui.basic.text", data);
                }
                me.set(window.var.editor, "ui.style.height", "100%");
                me.notify(window, "update");
            }, path, 'utf8');
        }
    };
};
