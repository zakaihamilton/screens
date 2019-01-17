/*
 @author Zakai Hamilton
 @component AppPropagate
 */

screens.app.propagate = function AppPropagate(me) {
    me.launch = function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element.create(__json__, "workspace", "self");
    };
    me.initOptions = async function (object) {
        var window = me.widget.window.get(object);
        me.ui.options.load(me, window, {

        });
        me.ui.options.toggleSet(me, null, {

        });
        me.core.property.set(window, "app", me);
    };
    me.selectFiles = function (object) {
        var window = me.widget.window.get(object);
        window.files = Array.from(object.files);
        me.core.property.set(me.ui.node.container(object, "widget.menu.popup"), "back");
        if (window.files && window.files.length) {
            me.file.set(object, window.files[0].name);
        }
    };
    me.files = function (object) {
        var window = me.widget.window.get(object);
        var info = {
            list: window.files,
            options: { "state": "select" },
            property: "name",
            group: "files",
            keepCase: true,
            emptyMsg: "No Files Selected",
            itemMethod: "app.propagate.file"
        };
        return me.widget.menu.collect(object, info);
    };
    me.file = {
        get: function (object, name) {
            var window = me.widget.window.get(object);
            var fileName = me.core.property.get(window, "name");
            return fileName.toLowerCase() === name.toLowerCase();
        },
        set: async function (object, name) {
            var window = me.widget.window.get(object);
            var file = window.files.find(file => file.name.toLowerCase() === name.toLowerCase());
            var text = await me.storage.upload.readFile(file, true);
            me.core.property.set(window, "name", name);
            me.core.property.set(window.var.editor, "text", text);
        }
    };
    me.importData = function (object, text, title) {
        var window = me.widget.window.get(object);
        me.core.property.set(window, "name", title);
        me.core.property.set(window.var.editor, "text", text);
    };
    me.exportText = function (object, target) {
        var window = me.widget.window.get(object);
        var text = me.core.property.get(window.var.editor, "text");
        me.core.property.set(target, "importData", text);
    };
};
