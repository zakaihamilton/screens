/*
 @author Zakai Hamilton
 @component WidgetMenu
 */

package.widget.menu = function WidgetMenu(me) {
    me.default = {
        "ui.basic.tag": "div"
    };
    me.class = ["widget.menu.border"];
    me.extend = ["ui.popup"];
    me.close = {
        set: function (object, value) {
            if (object.parentNode) {
                object.parentNode.removeChild(object);
            }
            me.ui.popup.close(object);
        }
    };
    me.select = {
        set: function (object, value) {
            me.ui.element.set(object, "close", value);
            me.ui.element.set(object, value, value);
        }
    };
};

package.widget.menu.item = function WidgetMenuItem(me) {
    me.default = {
        "ui.basic.tag": "button",
        "ui.event.click": "widget.menu.item.click"
    };
    me.class = "widget.menu.item";
    me.depends = {
        parent: ["widget.menu"],
        properties: ["ui.basic.text"]
    };
    me.select = {
        get: function (object) {
            return object.select_method;
        },
        set: function (object, value) {
            object.select_method = value;
            var enabled = me.ui.element.get(object.parentNode, value);
            me.ui.element.set(object, "ui.basic.enabled", enabled);
        }
    };
    me.click = {
        set: function (object) {
            me.ui.element.set(object.parentNode, "select", object.select_method);
        }
    };
};
