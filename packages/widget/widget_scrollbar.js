/*
 @author Zakai Hamilton
 @component WidgetScrollbar
 */

package.widget.scrollbar = function WidgetScrollbar(me) {

};

package.widget.scrollbar.horizontal = function WidgetScrollbarHorizontal(me) {
    me.class = "widget.scrollbar.horizontal";
    me.default = {
        "ui.basic.tag": "div",
        "ui.basic.context":null,
        "ui.basic.elements": [
            {
                "ui.theme.class": "widget.scrollbar.button",
                "ui.basic.var": "before",
                "ui.event.click": "widget.scrollbar.horizontal.before",
                "ui.style.position": "absolute",
                "ui.style.top": "-1px",
                "ui.style.left": "-1px",
                "ui.basic.elements": {
                    "ui.theme.class": "widget.scrollbar.horizontal.before"
                }
            },
            {
                "ui.theme.class": "widget.scrollbar.button",
                "ui.event.click": "widget.scrollbar.horizontal.after",
                "ui.basic.var": "after",
                "ui.style.position": "absolute",
                "ui.style.bottom": "-1px",
                "ui.style.right": "-1px",
                "ui.basic.elements": {
                    "ui.theme.class": "widget.scrollbar.horizontal.after"
                }
            },
            {
                "ui.basic.var": "thumb",
                "ui.theme.class": "widget.scrollbar.button",
                "ui.style.position": "absolute",
                "ui.style.top": "-1px",
                "ui.style.left": "-1px"
            }
        ]
    };
    me.update = function (object) {
        var window = me.widget.window.window(object);
        var h_scroll = me.ui.scroll.has_h_scroll(window.var.content);
        var has_class = me.set(window, "ui.theme.contains", "h_scroll");
        if (h_scroll && !has_class) {
            me.ui.property.broadcast(window, "ui.theme.add", "h_scroll");
        } else if (!h_scroll && has_class) {
            me.ui.property.broadcast(window, "ui.theme.remove", "h_scroll");
        }
        var scroll_percent = me.ui.scroll.scroll_h_percent(window.var.content);
        var before_region = me.ui.rect.relative_region(object.var.before);
        var after_region = me.ui.rect.relative_region(object.var.after);
        var thumb_region = me.ui.rect.relative_region(object.var.thumb);
        var left = before_region.left + before_region.width;
        var right = after_region.left - thumb_region.width;
        var position = 0;
        if (scroll_percent) {
            position = scroll_percent * ((right - left - 2) / 100);
        }
        me.set(object.var.thumb, "ui.style.left", left + position + "px");
    };
    me.draw = {
        set: function (object, value) {
            me.update(object);
        }
    };
    me.before = {
        set: function (object, value) {
            var window = me.widget.window.window(object);
            me.ui.scroll.by(window.var.content, -10, 0);
            me.update(object.parentNode);
        }
    };
    me.after = {
        set: function (object, value) {
            var window = me.widget.window.window(object);
            me.ui.scroll.by(window.var.content, 10, 0);
            me.update(object.parentNode);
        }
    };
};

package.widget.scrollbar.vertical = function WidgetScrollbarVertical(me) {
    me.class = "widget.scrollbar.vertical";
    me.default = {
        "ui.basic.tag": "div",
        "ui.basic.context":null,
        "ui.basic.elements": [
            {
                "ui.theme.class": "widget.scrollbar.button",
                "ui.basic.var": "before",
                "ui.event.click": "widget.scrollbar.vertical.before",
                "ui.style.position": "absolute",
                "ui.style.top": "-1px",
                "ui.style.left": "-1px",
                "ui.basic.elements": {
                    "ui.theme.class": "widget.scrollbar.vertical.before"
                }
            },
            {
                "ui.theme.class": "widget.scrollbar.button",
                "ui.event.click": "widget.scrollbar.vertical.after",
                "ui.basic.var": "after",
                "ui.style.position": "absolute",
                "ui.style.bottom": "-1px",
                "ui.style.right": "-1px",
                "ui.basic.elements": {
                    "ui.theme.class": "widget.scrollbar.vertical.after"
                }
            },
            {
                "ui.basic.var": "thumb",
                "ui.theme.class": "widget.scrollbar.button",
                "ui.style.position": "absolute",
                "ui.style.top": "-1px",
                "ui.style.left": "-1px"
            }
        ]
    };
    me.update = function (object) {
        var window = me.widget.window.window(object);
        var v_scroll = me.ui.scroll.has_v_scroll(window.var.content);
        var has_class = me.set(window, "ui.theme.contains", "v_scroll");
        if (v_scroll && !has_class) {
            me.ui.property.broadcast(window, "ui.theme.add", "v_scroll");
        } else if (!v_scroll && has_class) {
            me.ui.property.broadcast(window, "ui.theme.remove", "v_scroll");
        }
        var scroll_percent = me.ui.scroll.scroll_v_percent(window.var.content);
        var before_region = me.ui.rect.relative_region(object.var.before);
        var after_region = me.ui.rect.relative_region(object.var.after);
        var thumb_region = me.ui.rect.relative_region(object.var.thumb);
        var top = before_region.top + before_region.height;
        var bottom = after_region.top - thumb_region.height;
        var position = 0;
        if (scroll_percent) {
            position = scroll_percent * ((bottom - top - 2) / 100);
        }
        me.set(object.var.thumb, "ui.style.top", top + position + "px");
    };
    me.draw = {
        set: function (object, value) {
            me.update(object);
        }
    };
    me.before = {
        set: function (object, value) {
            var window = me.widget.window.window(object);
            me.ui.scroll.by(window.var.content, 0, -10);
            me.update(object.parentNode);
        }
    };
    me.after = {
        set: function (object, value) {
            var window = me.widget.window.window(object);
            me.ui.scroll.by(window.var.content, 0, 10);
            me.update(object.parentNode);
        }
    };
};
