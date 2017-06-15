/*
 @author Zakai Hamilton
 @component WidgetTitle
 */

package.widget.title = function WidgetTitle(me) {
    me.default = {
        "ui.basic.tag": "div"
    };
    me.class = ["widget.title.border"];
    me.draw = function (object) {
        var window = me.ui.element.to_object(object.window);
        var is_movable = window.properties['ui.style.position'] === "absolute";
        me.ui.element.create([{
                "ui.basic.var": "close",
                "ui.style.class": "widget.title.close",
                "ui.event.pressed": "widget.window.menu"
            },
            {
                "ui.basic.var": "title",
                "ui.basic.text": "Default",
                "ui.style.class": "widget.title.label",
                "ui.move.element": window.path
            }], object);
        if (is_movable) {
            me.ui.element.create([{
                    "ui.basic.var": "minimize",
                    "ui.style.class": "widget.title.action",
                    "ui.event.pressed": "widget.title.minimize",
                    "ui.style.right": "20px",
                    "ui.basic.elements": {
                        "ui.style.class": "widget.title.minimize",
                    }
                },
                {
                    "ui.basic.var": "maximize",
                    "ui.style.class": "widget.title.action",
                    "ui.event.pressed": "widget.title.maximize",
                    "ui.style.right": "0px",
                    "ui.basic.elements": {
                        "ui.style.class": "widget.title.maximize",
                    }
                },
                {
                    "ui.basic.var": "restore",
                    "ui.style.class": "widget.title.action",
                    "ui.event.pressed": "widget.title.restore",
                    "ui.style.right": "0px",
                    "ui.style.visibility": "hidden",
                    "ui.basic.elements": {
                        "ui.style.class": "widget.title.restore",
                    }
                }], object);
        } else {
            console.log("object.title: " + object.title);
            me.ui.element.set(object.title, "ui.style.right", "0px");
        }
        me.ui.element.set(object, "ui.basic.label", object.title);
    };
    me.window = {
        get: function (object) {
            return object.window;
        },
        set: function (object, value) {
            object.window = value;
        }
    };
    me.is_visible = function (object) {
        if (object) {
            var is_visible = me.ui.element.get(object, "ui.style.visibility");
            console.log("object: " + object + " visible: " + is_visible);
            return is_visible !== "hidden";
        }
    }
    me.close = {
        get: function (object) {
            return me.is_visible(object.parentNode.close);
        },
        set: function (object, value) {
            me.ui.element.set(object.parentNode.window, "widget.window.close", null);
        }
    };
    me.minimize = {
        get: function (object) {
            return me.is_visible(object.parentNode.minimize);
        },
        set: function (object, value) {

        }
    };
    me.maximize = {
        get: function (object) {
            return me.is_visible(object.parentNode.maximize);
        },
        set: function (object, value) {
            me.ui.element.set(object.parentNode.restore, "ui.style.visibility", "visible");
            me.ui.element.set(object.parentNode.maximize, "ui.style.visibility", "hidden");
            object.parentNode.restore_region = me.ui.rect.absolute_region(object.parentNode.window);
            me.ui.rect.set_absolute_region(object.parentNode.window, me.ui.rect.viewport());
            me.ui.element.set(object.parentNode.window, "ui.basic.draggable", false);
        }
    };
    me.restore = {
        get: function (object) {
            return me.is_visible(object.parentNode.restore);
        },
        set: function (object, value) {
            console.log("object: " + object.path);
            me.ui.element.set(object.parentNode.restore, "ui.style.visibility", "hidden");
            me.ui.element.set(object.parentNode.maximize, "ui.style.visibility", "visible");
            me.ui.rect.set_absolute_region(object.parentNode.window, object.parentNode.restore_region);
            me.ui.element.set(object.parentNode.window, "ui.basic.draggable", true);
        }
    };
};
