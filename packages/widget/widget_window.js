/*
 @author Zakai Hamilton
 @component WidgetWindow
 */

package.widget.window = function WidgetWindow(me) {
    me.require = {platform: "browser"};
    me.depends = {
        properties: ["title"]
    };
    me.extend = ["ui.move"];
    me.default = {
        "ui.basic.tag" : "div"
    };
    me.class = ["widget.window.border"];
    me.create = function (object) {
        me.ui.element.create([{
                "ui.style.class": "widget.window.left_bottom",
                "ui.resize.element": object.path
            },
            {
                "ui.style.class": "widget.window.right_bottom",
                "ui.resize.element": object.path
            },
            {
                "ui.style.class": "widget.window.content",
                "ui.basic.var": "content"
            },
            {
                "ui.style.class": "widget.window.left_top",
                "ui.resize.element": object.path
            },
            {
                "ui.style.class": "widget.window.right_top",
                "ui.resize.element": object.path
            },
            {
                "ui.basic.var":"title",
                "component": "widget.title",
                "widget.title.window":object.path
            }], object);
        object.icon = me.ui.element.create({
            "text":"",
            "ui.style.float" : "left",
            "ui.basic.src" : "/packages/res/icons/default.png",
            "ui.event.pressed" : "widget.window.menu",
        }, document.body.tray);
        console.log("document.body: " + document.body);
        console.log("document.body.tray: " + document.body.tray);
    };
    me.close = {
        set : function(object, value) {
            me.ui.element.set(object, "ui.node.parent", null);
            me.ui.element.set(object.icon, "ui.node.parent", null);
        }
    };
    me.icon = {
        get : function(object) {
            return me.ui.element.get(object.icon, "ui.basic.src");
        },
        set : function(object, value) {
            console.log("window icon: " + value + " title: " + object.title);
            me.ui.element.set(object.icon, "ui.basic.src", value);
        }
    };
    me.title = {
        get : function(object) {
            return me.ui.element.get(object.title, "ui.basic.text");
        },
        set : function(object, value) {
            console.log("window title: " + value + " object: " + object.title);
            me.ui.element.set(object.title, "ui.basic.text", value);
            me.ui.element.set(object.icon, "ui.basic.text", value);
        }
    };
    me.background = {
        get : function(object) {
            return me.ui.element.get(object.content, "ui.style.background");
        },
        set : function(object, value) {
            me.ui.element.set(object.content, "ui.style.background", value);
        }
    };
    me.menu = {
        set: function (object, value) {
            var region = me.ui.rect.relative_region(object);
            if (me.ui.element.get(object.menu, "ui.node.parent")) {
                me.ui.element.set(object.menu, "ui.node.parent", null);
            } else {
                object.menu = me.ui.element.create({
                    "component": "widget.menu",
                    "ui.style.left": "0px",
                    "ui.style.top": region.bottom + "px",
                    "ui.group.data": {
                        "ui.data.keys": ["ui.basic.text", "select"],
                        "ui.data.values": [
                            ["Restore", "widget.title.restore"],
                            ["Move", ""],
                            ["Size", ""],
                            ["Minimize", "widget.title.minimize"],
                            ["Maximize", "widget.title.maximize"],
                            ["Close", "widget.title.close"],
                            ["Switch To"]]
                    }
                }, object.parentNode);
            }
        }
    };
};
