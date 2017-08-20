/*
 @author Zakai Hamilton
 @component WidgetContainer
 */

package.widget.container = function WidgetContainer(me) {
    me.redirect = {
        "ui.basic.elements": "elements",
        "ui.basic.text": "text",
        "ui.basic.html": "html"
    };
    me.default = __json__;
    me.content = function (object) {
        return object.var.content;
    };
    me.isChild = function(container) {
        var isChild = false;
        var window = me.widget.window.window(container);
        if(window.var.container === container) {
            var parent = me.widget.window.parent(window);
            if(!parent && window.child_window) {
                isChild = true;
            }
        }
        return isChild;
    };
    me.elements = {
        set: function (object, value) {
            if (value) {
                me.ui.element.create(value, object.var.content, object.context);
            }
        }
    };
    me.update = {
        set: function(object, value) {
            setTimeout( function() {
                me.set(object.var.vertical, "update");
                me.set(object.var.horizontal, "update");
            }, 0);
            var containers = me.ui.node.members(object.var.content, me.id);
            containers.map(function(container) {
                me.set(container, "update");
            });
        }
    };
    me.text = {
        get: function (object) {
            return me.get(object.var.content, "ui.basic.text");
        },
        set: function (object, value) {
            me.set(object.var.content, "ui.basic.text", value);
        }
    };
    me.html = {
        get: function (object) {
            return me.get(object.var.content, "ui.basic.html");
        },
        set: function (object, value) {
            me.set(object.var.content, "ui.basic.html", value);
        }
    };
    me.empty = {
        set: function(object) {
            me.ui.node.empty(object.var.content);
            me.set(object, "update");
        }
    };
};
