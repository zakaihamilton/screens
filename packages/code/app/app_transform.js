/*
 @author Zakai Hamilton
 @component AppTransform
 */

screens.app.transform = function AppTransform(me) {
    me.launch = function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element.create(__json__, "workspace", "self");
    };
    me.init = async function () {
        await me.ui.content.attach(me);
        me.core.property.link("widget.transform.clear", "app.transform.clearEvent", true);
    };
    me.initOptions = {
        set: function (object) {
            var window = me.widget.window.get(object);
            me.ui.options.load(me, window, {
                showInput: false
            });
            me.ui.options.toggleSet(me, null, "showInput", function (object, value) {
                var window = me.widget.window.get(object);
                var text = me.core.property.get(window.var.transform, "text");
                if (!text) {
                    value = true;
                }
                me.updateWidgets(window, value);
                me.core.property.set(window.var.transform, "reflow");
            });
            me.core.property.set(window, "app", me);
            me.ui.class.useStylesheet("kab");
        }
    };
    me.exportText = function (object, target) {
        var window = me.widget.window.get(object);
        if (window.child_window) {
            window = window.child_window;
        }
        var text = me.core.property.get(window.var.transform, "text");
        me.core.property.set(target, "importData", text);
    };
    me.updateWidgets = function (object, showInput, update = true) {
        var window = me.widget.window.get(object);
        me.core.property.set([window.var.input, window.var.doTransform], "ui.style.display", showInput ? "inline-block" : "none");
        me.core.property.set(window.var.transform, "ui.style.top", showInput ? "250px" : "0px");
        if (update) {
            me.core.property.notify(window, "update");
        }
    };
    me.clearEvent = {
        set: function (object) {
            var window = me.widget.window.get(object);
            me.core.property.set(window.var.input, {
                "ui.basic.text": "",
                "storage.local.store": ""
            });
            me.updateWidgets(window, true);
        }
    };
    me.transform = {
        set: function (object) {
            var window = me.widget.window.get(object);
            me.core.property.set(window.var.input, "ui.basic.save");
            var text = me.core.property.get(window.var.input, "ui.basic.text");
            me.updateWidgets(window, window.options.showInput || !text, false);
            if (!text) {
                return;
            }
            me.core.property.set(window.var.transform, "text", text);
            me.core.property.set(window.var.transform, "transform");
        }
    };
    me.importData = function (object, text, title) {
        var window = me.widget.window.get(object);
        me.core.property.set(window, "widget.window.name", title);
        me.core.property.set(window.var.input, "ui.basic.text", text);
        me.core.property.set(window, "app.transform.transform");
    };
    me.exportData = function (object) {
        var window = me.widget.window.get(object);
        var data = me.core.property.get(window.var.input, "ui.basic.text");
        return [data];
    };
    me.documentIndex = {
        set: function (object, value) {
            var title = value;
            if (!isNaN(value)) {
                title = "Document " + value;
            }
            me.core.property.set(object, "widget.window.key", title);
            me.core.property.set(object, "widget.window.name", title);
        }
    };
};
