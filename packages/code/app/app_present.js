/*
 @author Zakai Hamilton
 @component AppPresent
 */

screens.app.present = function AppPresent(me) {
    me.init = function () {
        me.ui.content.attach(me);
        me.ui.shared.attach(me);
    };
    me.launch = async function (args) {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            if (typeof args[0] === "string") {
                await me.content.import(me.singleton, args[0], args[1]);
            }
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        var params = {};
        if (typeof args[0] === "string") {
            [params.text, params.title] = await me.content.get(args[0]);
        }
        me.singleton = me.ui.element.create(__json__, "workspace", "self", params);
        if (typeof args[0] === "string") {
            me.content.associated.update(me.singleton, params.title);
        }
    };
    me.initOptions = async function (object) {
        var window = me.widget.window.get(object);
        me.ui.options.load(me, window, {
            editMode: false,
            userName: ""
        });
        me.ui.options.choiceSet(me, null, {
            "userName": me.updateUser
        });
        me.ui.options.toggleSet(me, null, {
            "editMode": me.updateEditMode
        });
        me.core.property.set(window, "app", me);
        me.shared.refresh(window);
        me.updateEditMode(window);
    };
    me.importData = function (object, text, title) {
        var window = me.widget.window.get(object);
        me.core.property.set(window.var.editor, "text", text);
        me.core.property.set(window.var.editor, "ui.basic.save");
        me.core.property.set(window, "widget.window.name", title);
        window.options.userName = "";
        me.updateEditMode(window);
    };
    me.updateEditMode = function (object) {
        var window = me.widget.window.get(object);
        me.core.property.set(window.var.transform, "ui.style.opacity", window.options.editMode ? "0" : "");
        me.core.property.set([window.var.editor, window.var.editorContainer], "ui.basic.show", window.options.editMode);
        if (!window.options.userName) {
            me.shared.update(object);
        }
        me.updateUser(object);
    };
    me.refresh = function (object) {
        var window = me.widget.window.get(object);
        me.shared.refresh(object);
        me.updateUser(window);
    };
    me.updateUser = async function (object) {
        var window = me.widget.window.get(object);
        var content = await me.shared.content(object);
        if (content === undefined) {
            content = me.core.property.get(window.var.editor, "text");
        }
        var previousText = me.core.property.get(window.var.transform, "text");
        if (content !== previousText) {
            me.core.property.set(window.var.transform, "text", content);
            me.core.property.set(window.var.transform, "transform");
        }
    };
    me.clear = function (object) {
        var window = me.widget.window.get(object);
        me.core.property.set(window.var.editor, "text", "");
        me.core.property.set(window.var.editor, "ui.basic.save");
        me.updateEditMode(window);
    };
    me.exportText = function (object, target) {
        var window = me.widget.window.get(object);
        var text = me.core.property.get(window.var.editor, "text");
        me.core.property.set(target, "importData", text);
    };
    me.exportData = function (object) {
        var window = me.widget.window.get(object);
        var text = me.core.property.get(window.var.editor, "text");
        return [text];
    };
};
