/*
 @author Zakai Hamilton
 @component WidgetContainer
 */

screens.widget.container = function WidgetContainer(me) {
    me.element = {
        redirect : {
            "ui.basic.elements": "elements",
            "ui.basic.text": "text",
            "ui.basic.html": "html"
        },
        properties : __json__
    };
    me.content = function (object) {
        return object.var.content;
    };
    me.isChild = function (container) {
        var isChild = false;
        var window = me.widget.window(container);
        if (window && window.var.container === container) {
            var parent = me.widget.window.parent(window);
            if (!parent && window.child_window) {
                isChild = true;
            }
        }
        return isChild;
    };
    me.elements = {
        set: function (object, value) {
            if (value) {
                me.ui.element(value, object.var.content, object.context);
            }
        }
    };
    me.update = {
        set: function (object, value) {
            setTimeout(function () {
                me.core.property.notify(object.var.vertical, "update");
                me.core.property.notify(object.var.horizontal, "update");
            }, 0);
            var containers = me.ui.node.members(object.var.content, me.id);
            containers.map(function (container) {
                me.core.property.notify(container, "update");
            });
        }
    };
    me.text = {
        get: function (object) {
            return me.core.property.get(object.var.content, "ui.basic.text");
        },
        set: function (object, value) {
            me.core.property.set(object.var.content, "ui.basic.text", value);
        }
    };
    me.html = {
        get: function (object) {
            return me.core.property.get(object.var.content, "ui.basic.html");
        },
        set: function (object, value) {
            me.core.property.set(object.var.content, "ui.basic.html", value);
        }
    };
    me.empty = {
        set: function (object) {
            me.ui.node.empty(object.var.content);
            me.core.property.notify(object, "update");
        }
    };
};
