/*
 @author Zakai Hamilton
 @component WidgetScrollbar
 */

package.widget.scrollbar = function WidgetScrollbar(me) {

};

package.widget.scrollbar.horizontal = function WidgetScrollbarHorizontal(me) {
    me.class = "widget.scrollbar.horizontal";
    me.create = {
        set: function (object, value) {
            me.ui.element.create({
                "ui.basic.tag": "div",
                "ui.basic.elements": [
                    {
                        "ui.theme.class": "widget.scrollbar.button",
                        "ui.event.click": "before",
                        "ui.style.position": "absolute",
                        "ui.style.top": "0px",
                        "ui.style.left": "0px",
                        "ui.basic.elements": {
                            "ui.theme.class": "widget.scrollbar.horizontal.before"
                        }
                    },
                    {
                        "ui.theme.class": "widget.scrollbar.button",
                        "ui.event.click": "after",
                        "ui.style.position": "absolute",
                        "ui.style.bottom": "0px",
                        "ui.style.right": "0px",
                        "ui.basic.elements": {
                            "ui.theme.class": "widget.scrollbar.horizontal.after"
                        }
                    },
                    {
                        "ui.basic.var": "scroll_pos",
                        "ui.theme.class": "widget.scrollbar.button",
                        "ui.style.position": "absolute",
                        "ui.style.left": "100px",
                        "ui.style.top": "0px"
                    }
                ]}, object);
        }
    };
    me.update = function (object) {
        var window = me.widget.window.window(object);
        var h_scroll = me.ui.scroll.has_h_scroll(window.content);
        var has_class = me.set(window, "ui.theme.contains", "h_scroll");
        if (h_scroll && !has_class) {
            me.ui.property.broadcast(window, "ui.theme.add", "h_scroll");
        } else if (!h_scroll && has_class) {
            me.ui.property.broadcast(window, "ui.theme.remove", "h_scroll");
        }
    };
    me.draw = {
        set: function (object, value) {
            me.update(object);
        }
    };
    me.before = {
        set: function (object, value) {

        }
    };
    me.after = {
        set: function (object, value) {

        }
    };
};

package.widget.scrollbar.vertical = function WidgetScrollbarVertical(me) {
    me.class = "widget.scrollbar.vertical";
    me.create = {
        set: function (object, value) {
            me.ui.element.create({
                "ui.basic.tag": "div",
                "ui.basic.elements": [
                    {
                        "ui.theme.class": "widget.scrollbar.button",
                        "ui.event.click": "before",
                        "ui.style.position": "absolute",
                        "ui.style.top": "0px",
                        "ui.style.left": "0px",
                        "ui.basic.elements": {
                            "ui.theme.class": "widget.scrollbar.vertical.before"
                        }
                    },
                    {
                        "ui.theme.class": "widget.scrollbar.button",
                        "ui.event.click": "after",
                        "ui.style.position": "absolute",
                        "ui.style.bottom": "0px",
                        "ui.style.right": "0px",
                        "ui.basic.elements": {
                            "ui.theme.class": "widget.scrollbar.vertical.after"
                        }
                    },
                    {
                        "ui.basic.var": "scroll_pos",
                        "ui.theme.class": "widget.scrollbar.button",
                        "ui.style.position": "absolute",
                        "ui.style.left": "0px",
                        "ui.style.top": "100px"
                    }
                ]}, object);
        }
    };
    me.update = function (object) {
        var window = me.widget.window.window(object);
        var v_scroll = me.ui.scroll.has_v_scroll(window.content);
        var has_class = me.set(window, "ui.theme.contains", "v_scroll");
        if (v_scroll && !has_class) {
            me.ui.property.broadcast(window, "ui.theme.add", "v_scroll");
        } else if (!v_scroll && has_class) {
            me.ui.property.broadcast(window, "ui.theme.remove", "v_scroll");
        }
    };
    me.draw = {
        set: function (object, value) {
            me.update(object);
        }
    };
    me.before = {
        set: function (object, value) {

        }
    };
    me.after = {
        set: function (object, value) {

        }
    };
};
