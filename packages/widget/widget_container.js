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
        var window = me.the.widget.window.window(container);
        if(window && window.var.container === container) {
            var parent = me.the.widget.window.parent(window);
            if(!parent && window.child_window) {
                isChild = true;
            }
        }
        return isChild;
    };
    me.elements = {
        set: function (object, value) {
            if (value) {
                me.the.ui.element.create(value, object.var.content, object.context);
            }
        }
    };
    me.update = {
        set: function(object, value) {
            setTimeout( function() {
                me.the.core.property.notify(object.var.vertical, "update");
                me.the.core.property.notify(object.var.horizontal, "update");
            }, 0);
            var containers = me.the.ui.node.members(object.var.content, me.id);
            containers.map(function(container) {
                me.the.core.property.notify(container, "update");
            });
        }
    };
    me.text = {
        get: function (object) {
            return me.the.core.property.get(object.var.content, "ui.basic.text");
        },
        set: function (object, value) {
            me.the.core.property.set(object.var.content, "ui.basic.text", value);
        }
    };
    me.html = {
        get: function (object) {
            return me.the.core.property.get(object.var.content, "ui.basic.html");
        },
        set: function (object, value) {
            me.the.core.property.set(object.var.content, "ui.basic.html", value);
        }
    };
    me.empty = {
        set: function(object) {
            me.the.ui.node.empty(object.var.content);
            me.the.core.property.notify(object, "update");
        }
    };
};
