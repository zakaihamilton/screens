/*
 @author Zakai Hamilton
 @component AppNotes
 */

screens.app.notes = function AppNotes(me) {
    me.init = function () {
        me.ui.content.attach(me);
    };
    me.launch = function (args) {
        if (!args) {
            args = [""];
        }
        var window = me.ui.element.create(__json__, "workspace", "self");
        if (typeof args[0] === "string") {
            me.content.import(window, args[0]);
        }
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
            window.autoSaveInterval = setInterval(() => {
                me.core.property.set(window.var.editor, "ui.basic.save", { method: "contents", json: true });
            }, 1000);
            me.core.property.set(window.var.container, "ui.style.overflow", "hidden");
        }
    };
    me.close = function (object) {
        var window = me.widget.window.get(object);
        clearInterval(window.autoSaveInterval);
    };
    me.clear = function (object) {
        var window = me.widget.window.get(object);
        me.core.property.set(window, "title", "Notes");
        me.core.property.set(window.var.editor, "text", "");
    };
    me.importData = function (object, text, title, options) {
        var window = me.widget.window.get(object);
        me.core.property.set(window, "title", title);
        me.core.property.set(window.var.editor, "contents", JSON.parse(text));
        me.core.property.set(window.var.editor, "ui.basic.save");
    };
    me.exportData = function (object) {
        var window = me.widget.window.get(object);
        var title = me.core.property.get(window, "title");
        var content = me.core.property.get(window.var.editor, "contents");
        return [JSON.stringify(content), title];
    };
};
