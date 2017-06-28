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
        "ui.basic.context": null,
        "ui.basic.elements": [
            {
                "ui.theme.class": ["widget.scrollbar.button","widget.scrollbar.horizontal.before"],
                "ui.basic.var": "before",
                "ui.event.click": "widget.scrollbar.horizontal.before",
                "ui.style.position": "relative",
                "ui.basic.elements": {
                    "ui.theme.class": "widget.scrollbar.left.arrow"
                }
            },
            {
                "ui.basic.var":"track",
                "ui.theme.class": "widget.scrollbar.horizontal.track",
                "ui.basic.elements": {
                    "ui.basic.var": "thumb",
                    "ui.scroll.thumb": "h",
                    "ui.theme.class": ["widget.scrollbar.button","widget.scrollbar.horizontal.thumb"],
                    "ui.style.position": "relative",
                }
            },
            {
                "ui.theme.class": ["widget.scrollbar.button","widget.scrollbar.horizontal.after"],
                "ui.basic.var": "after",
                "ui.event.click": "widget.scrollbar.horizontal.after",
                "ui.style.position": "relative",
                "ui.basic.elements": {
                    "ui.theme.class": "widget.scrollbar.right.arrow"
                }
            },
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
        var thumb_region = me.ui.rect.relative_region(object.var.thumb);
        var track_region = me.ui.rect.relative_region(object.var.track);
        var position = 0;
        if (scroll_percent) {
            var length = track_region.width - thumb_region.width;
            position = me.ui.scroll.percent_to_pos(length, scroll_percent);
        }
        me.set(object.var.thumb, "ui.style.left", position + "px");
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
        "ui.basic.context": null,
        "ui.basic.elements": [
            {
                "ui.theme.class": ["widget.scrollbar.button","widget.scrollbar.vertical.before"],
                "ui.basic.var": "before",
                "ui.event.click": "widget.scrollbar.vertical.before",
                "ui.style.position": "relative",
                "ui.basic.elements": {
                    "ui.theme.class": "widget.scrollbar.top.arrow"
                }
            },
            {
                "ui.basic.var":"track",
                "ui.theme.class": "widget.scrollbar.vertical.track",
                "ui.basic.elements": {
                    "ui.basic.var": "thumb",
                    "ui.theme.class": ["widget.scrollbar.button","widget.scrollbar.vertical.thumb"],
                    "ui.scroll.thumb": "v",
                    "ui.style.position": "relative"
                }
            },
            {
                "ui.theme.class": ["widget.scrollbar.button","widget.scrollbar.vertical.after"],
                "ui.basic.var": "after",
                "ui.event.click": "widget.scrollbar.vertical.after",
                "ui.style.position": "relative",
                "ui.basic.elements": {
                    "ui.theme.class": "widget.scrollbar.bottom.arrow"
                }
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
        var track_region = me.ui.rect.relative_region(object.var.track);
        var thumb_region = me.ui.rect.relative_region(object.var.thumb);
        var position = 0;
        if (scroll_percent) {
            var length = track_region.height - thumb_region.height;
            position = me.ui.scroll.percent_to_pos(length, scroll_percent);
        }
        me.set(object.var.thumb, "ui.style.top", position + "px");
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
