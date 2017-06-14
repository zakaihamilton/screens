/*
 @author Zakai Hamilton
 @component WidgetWindow
 */

package.widget.window = function WidgetWindow(me) {
    me.require = {platform: "browser"};
    me.depends = {
        properties: ["title"]
    };
    me.extend = ["ui.move","ui.resize"];
    me.default = {
        "ui.basic.tag" : "div"
    };
    me.class = ["widget.window.border"];
    me.create = function (object) {
        me.ui.element.create([{
                "ui.style.class": "widget.window.left_bottom"
            },
            {
                "ui.style.class": "widget.window.right_bottom"
            },
            {
                "ui.style.class": "widget.window.content",
                "ui.basic.var": "content"
            },
            {
                "ui.style.class": "widget.window.left_top"
            },
            {
                "ui.style.class": "widget.window.right_top"
            },
            {
                "ui.basic.var":"title",
                "component": "widget.title",
                "widget.title.window":object.path
            }], object);
    };
    me.title = {
        get : function(object) {
            return me.ui.element.get(object.title, "ui.basic.text");
        },
        set : function(object, value) {
            console.log("window title: " + value + " object: " + object.title);
            me.ui.element.set(object.title, "ui.basic.text", value);
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
};
