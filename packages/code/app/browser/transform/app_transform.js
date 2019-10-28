/*
 @author Zakai Hamilton
 @component AppTransform
 */

screens.app.transform = function AppTransform(me, { core, ui, widget }) {
    me.launch = async function () {
        if (core.property.get(me.singleton, "ui.node.parent")) {
            core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        await me.content.update();
        me.singleton = ui.element.create(me.json, "workspace", "self");
    };
    me.init = async function () {
        core.property.link("widget.transform.clear", "app.transform.clearEvent", true);
        await ui.content.implement(me);
    };
    me.initOptions = {
        set: function (object) {
            var window = widget.window.get(object);
            ui.options.load(me, window, {
                showInput: false
            });
            ui.options.toggleSet(me, null, "showInput", function (object, value) {
                var window = widget.window.get(object);
                var text = core.property.get(window.var.transform, "text");
                if (!text) {
                    value = true;
                }
                me.updateWidgets(window, value);
                core.property.set(window.var.transform, "reflow");
            });
            core.property.set(window, "app", me);
        }
    };
    me.exportText = function (object, target) {
        var window = widget.window.get(object);
        if (window.child_window) {
            window = window.child_window;
        }
        var text = core.property.get(window.var.transform, "text");
        core.property.set(target, "importData", text);
    };
    me.updateWidgets = function (object, showInput, update = true) {
        var window = widget.window.get(object);
        core.property.set([window.var.input, window.var.doTransform], "ui.style.display", showInput ? "inline-block" : "none");
        core.property.set(window.var.transform, "ui.style.top", showInput ? "260px" : "0px");
        if (update) {
            core.property.notify(window, "update");
        }
    };
    me.clearEvent = {
        set: function (object) {
            var window = widget.window.get(object);
            core.property.set(window.var.input, {
                "ui.basic.text": "",
                "storage.local.store": ""
            });
            me.updateWidgets(window, true);
        }
    };
    me.transform = {
        set: function (object) {
            var window = widget.window.get(object);
            core.property.set(window.var.input, "ui.basic.save");
            var text = core.property.get(window.var.input, "ui.basic.text");
            me.updateWidgets(window, window.options.showInput || !text, false);
            if (!text) {
                return;
            }
            core.property.set(window.var.transform, "text", text);
            core.property.set(window.var.transform, "transform");
        }
    };
    me.importData = function (object, text, title) {
        var window = widget.window.get(object);
        core.property.set(window, "widget.window.name", title);
        core.property.set(window.var.input, "ui.basic.text", text);
        core.property.set(window, "app.transform.transform");
    };
    me.exportData = function (object) {
        var window = widget.window.get(object);
        var data = core.property.get(window.var.input, "ui.basic.text");
        return [data];
    };
    me.documentIndex = {
        set: function (object, value) {
            var title = value;
            if (!isNaN(value)) {
                title = "Document " + value;
            }
            core.property.set(object, "widget.window.key", title);
            core.property.set(object, "widget.window.name", title);
        }
    };
};
