/*
 @author Zakai Hamilton
 @component AppNotes
 */

screens.app.notes = function AppNotes(me, packages) {
    const { core } = packages;
    me.init = async function () {
        await me.ui.content.implement(me);
    };
    me.launch = async function (args) {
        if (!args) {
            args = [""];
        }
        if (core.property.get(me.singleton, "ui.node.parent")) {
            if (typeof args[0] === "string") {
                await me.content.import(me.singleton, args[0], args[1]);
            }
            core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        await me.content.update();
        var window = me.ui.element.create(me.json, "workspace", "self");
        if (typeof args[0] === "string") {
            await me.content.import(window, args[0], args[1]);
        }
        me.singleton = window;
        return window;
    };
    me.initOptions = {
        set: function (object) {
            var window = me.widget.window.get(object);
            me.ui.options.load(me, window, {

            });
            me.ui.options.toggleSet(me, null, {

            });
            me.ui.options.choiceSet(me, null, {

            });
            core.property.set(window, "app", me);
            window.autoSaveInterval = setInterval(() => me.update(window), 1000);
            core.property.set(window.var.container, "ui.style.overflow", "hidden");
        }
    };
    me.update = function (object) {
        var window = me.widget.window.get(object);
        var title = core.property.get(window, "app.notes.content.title");
        core.property.set(window, "name", title);
        core.property.set(window.var.editor, "ui.basic.save", { method: "contents", json: true });
    };
    me.close = function (object) {
        var window = me.widget.window.get(object);
        clearInterval(window.autoSaveInterval);
    };
    me.clear = function (object) {
        var window = me.widget.window.get(object);
        core.property.set(window, "name", "");
        core.property.set(window.var.editor, "text", "");
    };
    me.importData = function (object, text, title) {
        var window = me.widget.window.get(object);
        core.property.set(window, "widget.window.name", title);
        if (text.trim().startsWith("{")) {
            core.property.set(window.var.editor, "contents", JSON.parse(text));
        }
        else {
            core.property.set(window.var.editor, "text", text);
        }
        core.property.set(window.var.editor, "ui.basic.save");
    };
    me.exportData = function (object) {
        var window = me.widget.window.get(object);
        var content = core.property.get(window.var.editor, "contents");
        return [JSON.stringify(content)];
    };
    me.exportText = function (object, target) {
        var window = me.widget.window.get(object);
        var text = core.property.get(window.var.editor, "text");
        core.property.set(target, "importData", text);
    };
    me.insertLink = function (object, info) {
        var window = me.widget.window.get(object);
        core.property.set(window.var.editor, "insertLink", info);
    };
};
