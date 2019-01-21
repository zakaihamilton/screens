/*
 @author Zakai Hamilton
 @component AppNotes
 */

screens.app.notes = function AppNotes(me) {
    me.init = async function () {
        await me.ui.content.attach(me);
    };
    me.launch = async function (args) {
        if (!args) {
            args = [""];
        }
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            if (typeof args[0] === "string") {
                await me.content.import(me.singleton, args[0], args[1]);
            }
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        var window = me.ui.element.create(__json__, "workspace", "self");
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
            me.core.property.set(window, "app", me);
            window.autoSaveInterval = setInterval(() => me.update(window), 1000);
            me.core.property.set(window.var.container, "ui.style.overflow", "hidden");
        }
    };
    me.update = function (object) {
        var window = me.widget.window.get(object);
        var title = me.core.property.get(window.var.editor, "text").split("\n")[0];
        me.core.property.set(window, "name", title);
        me.core.property.set(window.var.editor, "ui.basic.save", { method: "contents", json: true });
    };
    me.close = function (object) {
        var window = me.widget.window.get(object);
        clearInterval(window.autoSaveInterval);
    };
    me.clear = function (object) {
        var window = me.widget.window.get(object);
        me.core.property.set(window, "name", "");
        me.core.property.set(window.var.editor, "text", "");
    };
    me.importData = function (object, text, title) {
        var window = me.widget.window.get(object);
        me.core.property.set(window, "widget.window.name", title);
        if (text.trim().startsWith("{")) {
            me.core.property.set(window.var.editor, "contents", JSON.parse(text));
        }
        else {
            me.core.property.set(window.var.editor, "text", text);
        }
        me.core.property.set(window.var.editor, "ui.basic.save");
    };
    me.exportData = function (object) {
        var window = me.widget.window.get(object);
        var content = me.core.property.get(window.var.editor, "contents");
        return [JSON.stringify(content)];
    };
    me.exportText = function (object, target) {
        var window = me.widget.window.get(object);
        var text = me.core.property.get(window.var.editor, "text");
        me.core.property.set(target, "importData", text);
    };
    me.insertLink = function (object, info) {
        var window = me.widget.window.get(object);
        me.core.property.set(window.var.editor, "insertLink", info);
    };
};
