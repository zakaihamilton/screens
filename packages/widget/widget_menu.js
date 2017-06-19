/*
 @author Zakai Hamilton
 @component WidgetMenu
 */

package.widget.menu = function WidgetMenu(me) {
    me.default = {
        "ui.basic.tag": "div",
    };
    me.class = ["widget.menu.horizontal"];
    me.items = {
        set : function(object, value) {
            if(!object.menu) {
                object.menu = me.ui.element.create({
                    "ui.element.component":"widget.menu",
                    "ui.style.position":"absolute",
                    "ui.basic.window":object,
                    "ui.group.data": {
                        "ui.data.keys": ["ui.basic.text", "select"],
                        "ui.data.values": value
                    }
                }, object.content);
            }
        }
    }
};

package.widget.menu.popup = function WidgetMenuPopup(me) {
    me.default = {
        "ui.basic.tag": "div",
    };
    me.container = {
        "ui.modal.popup":"widget.menu.popup.close",
    };
    me.class = ["widget.menu.vertical"];
    me.close = {
        set: function (object, value) {
            me.ui.modal.close(object);
        }
    };
    me.select = {
        set: function (object, value) {
            me.ui.element.set(object, "close", value);
            me.ui.element.set(object, value, value);
        }
    };
};

package.widget.menu.horizontal_item = function WidgetMenuHorizontalItem(me) {
    me.default = {
        "ui.basic.tag": "a",
        "ui.event.click": "click",
        "ui.basic.href":"#"
    };
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

package.widget.menu.vertical_item = function WidgetMenuVerticalItem(me) {
    me.default = {
        "ui.basic.tag": "a",
        "ui.event.click": "click",
        "ui.basic.href":"#"
    };
    me.depends = {
        parent: ["widget.menu.popup"],
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
        set: function (object, value) {
            me.ui.element.set(object.parentNode, "select", object.select_method);
        }
    };
};
