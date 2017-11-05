/*
 @author Zakai Hamilton
 @component WidgetContainer
 */

package.widget.container = function WidgetContainer(me) {
    me["core.property.redirect"] = {
        "ui.basic.elements": "elements",
        "ui.basic.text": "text",
        "ui.basic.html": "html"
    };
    me["ui.element.default"] = __json__;
    me.content = function (object) {
        return object.var.content;
    };
    me.isChild = function(container) {
        var isChild = false;
        var window = me.package.widget.window.window(container);
        if(window && window.var.container === container) {
            var parent = me.package.widget.window.parent(window);
            if(!parent && window.child_window) {
                isChild = true;
            }
        }
        return isChild;
    };
    me.elements = {
        set: function (object, value) {
            if (value) {
                me.package.ui.element.create(value, object.var.content, object.context);
            }
        }
    };
    me.update = {
        set: function(object, value) {
            setTimeout( function() {
                me.package.core.property.notify(object.var.vertical, "update");
                me.package.core.property.notify(object.var.horizontal, "update");
            }, 0);
            var containers = me.package.ui.node.members(object.var.content, me.id);
            containers.map(function(container) {
                me.package.core.property.notify(container, "update");
            });
        }
    };
    me.text = {
        get: function (object) {
            return me.package.core.property.get(object.var.content, "ui.basic.text");
        },
        set: function (object, value) {
            me.package.core.property.set(object.var.content, "ui.basic.text", value);
        }
    };
    me.html = {
        get: function (object) {
            return me.package.core.property.get(object.var.content, "ui.basic.html");
        },
        set: function (object, value) {
            me.package.core.property.set(object.var.content, "ui.basic.html", value);
        }
    };
    me.empty = {
        set: function(object) {
            me.package.ui.node.empty(object.var.content);
            me.package.core.property.notify(object, "update");
        }
    };
};
