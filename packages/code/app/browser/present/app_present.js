/*
 @author Zakai Hamilton
 @component AppPresent
 */

screens.app.present = function AppPresent(me, { core }) {
    me.init = async function () {
        await me.ui.content.implement(me);
        await me.ui.shared.implement(me);
    };
    me.launch = async function (args) {
        if (core.property.get(me.singleton, "ui.node.parent")) {
            if (typeof args[0] === "string") {
                await me.content.import(me.singleton, args[0], args[1]);
            }
            core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        await me.content.update();
        var params = {};
        if (typeof args[0] === "string") {
            [params.text, params.title] = await me.content.get(args[0]);
            params.resetUser = true;
        }
        me.singleton = me.ui.element.create(me.json, "workspace", "self", params);
        if (typeof args[0] === "string") {
            await me.content.associated.update(me.singleton, params.title);
        }
    };
    me.initOptions = async function (object, resetUser) {
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
        core.property.set(window, "app", me);
        if (resetUser) {
            window.options.userName = "";
        }
        me.shared.refresh(window);
        me.updateEditMode(window);
    };
    me.importData = function (object, text, title) {
        var window = me.widget.window.get(object);
        core.property.set(window.var.editor, "text", text);
        core.property.set(window.var.editor, "ui.basic.save");
        core.property.set(window, "widget.window.name", title);
        window.options.userName = "";
        me.updateEditMode(window);
    };
    me.updateEditMode = function (object) {
        var window = me.widget.window.get(object);
        core.property.set(window.var.transform, "ui.style.opacity", window.options.editMode ? "0" : "");
        core.property.set([window.var.editor, window.var.editorContainer], "ui.basic.show", window.options.editMode);
        if (!window.options.userName) {
            var [content] = me.exportData(object);
            me.shared.update(content);
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
        var content = undefined;
        if (window.options.userName) {
            content = await me.shared.content(object);
        }
        else {
            content = core.property.get(window.var.editor, "text");
        }
        var previousText = core.property.get(window.var.transform, "text");
        if (!content) {
            content = "";
        }
        if (content !== previousText) {
            core.property.set(window.var.transform, "text", content);
            await core.property.set(window.var.transform, "transform");
        }
        var title = core.property.get(window.var.transform, "contentTitle");
        if (title) {
            core.property.set(window, "app.present.content.title", title);
        }
    };
    me.clear = function (object) {
        var window = me.widget.window.get(object);
        core.property.set(window.var.editor, "text", "");
        core.property.set(window.var.editor, "ui.basic.save");
        window.options.userName = "";
        me.updateEditMode(window);
    };
    me.exportText = function (object, target) {
        var window = me.widget.window.get(object);
        var text = core.property.get(window.var.editor, "text");
        core.property.set(target, "importData", text);
    };
    me.exportData = function (object) {
        var window = me.widget.window.get(object);
        var text = core.property.get(window.var.editor, "text");
        return [text];
    };
};
