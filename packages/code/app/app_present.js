/*
 @author Zakai Hamilton
 @component AppPresent
 */

screens.app.present = function AppPresent(me) {
    me.launch = function (args) {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element(__json__, "workspace", "self");
    };
    me.initOptions = async function (object) {
        var window = me.widget.window(object);
        me.ui.options.load(me, window, {
            editMode: false
        });
        me.ui.options.toggleSet(me, null, {
            "editMode": me.updateEditMode
        });
        me.core.property.set(window, "app", me);
        me.updateEditMode(window);
    };
    me.importData = function(object, text) {
        var window = me.widget.window(object);
        me.core.property.set(window.var.editor, "text", text);
        me.core.property.set(window.var.transform, "text", text);
        me.core.property.set(window.var.transform, "transform");
        me.core.property.set(window.var.editor, "ui.basic.save");
    };
    me.updateEditMode = function (object) {
        var window = me.widget.window(object);
        me.core.property.set(window.var.transform, "ui.style.opacity", window.options.editMode ? "0" : "");
        me.core.property.set([window.var.editor, window.var.editorContainer], "ui.basic.show", window.options.editMode);
        var text = me.core.property.get(window.var.editor, "text");
        me.core.property.set(window.var.transform, "text", text);
        me.core.property.set(window.var.transform, "transform");
    };
    me.refresh = function(object) {
        var window = me.widget.window(object);
        me.core.property.set(window.var.transform, "transform");
    };
    me.clear = function (object) {
        var window = me.widget.window(object);
        me.core.property.set(window.var.editor, "text", "");
        me.core.property.set(window.var.editor, "ui.basic.save");
        me.core.property.set(window.var.transform, "text", "");
        me.core.property.set(window.var.transform, "transform");
        window.searchText = "";
    };
    me.exportText = function(object, target) {
        var window = me.widget.window(object);
        var text = me.core.property.get(window.var.editor, "text");
        me.core.property.set(target, "importData", text);
    };
};
