/*
 @author Zakai Hamilton
 @component WidgetScrollbar
 */

function WidgetScrollbarTemplate(me, scroll_type) {
    console.log("scrolling: " + scroll_type);
    me.default = {
        "ui.theme.class": "widget.scrollbar." + scroll_type,
        "ui.basic.elements": [
            {
                "ui.theme.class": ["widget.scrollbar.button", "before"],
                "ui.basic.var": "before",
                "ui.touch.click": "before",
                "ui.touch.repeat": "before",
                "ui.style.position": "relative",
                "ui.basic.elements": {
                    "ui.theme.class": "before.arrow"
                }
            },
            {
                "ui.basic.var": "track",
                "ui.theme.class": "track",
                "ui.touch.click": "track",
                "ui.touch.repeat": "track",
                "ui.basic.elements": {
                    "ui.basic.var": "thumb",
                    "ui.theme.class": ["widget.scrollbar.button", "thumb"],
                    "ui.scroll.thumb": scroll_type,
                    "ui.style.position": "relative"
                }
            },
            {
                "ui.theme.class": ["widget.scrollbar.button", "after"],
                "ui.basic.var": "after",
                "ui.touch.click": "after",
                "ui.touch.repeat": "after",
                "ui.style.position": "relative",
                "ui.basic.elements": {
                    "ui.theme.class": "after.arrow"
                }
            }
        ]
    };
    me.update = {
        set: function (object) {
            var container = me.ui.node.container(object, me.widget.container.id);
            var content = me.widget.container.content(container);
            var has_scroll = me.ui.scroll.has_scroll(content, scroll_type);
            var has_class = me.set(container, "ui.theme.contains", scroll_type + "_scroll");
            if (has_scroll && !has_class) {
                me.set(container, "ui.property.broadcast", {
                    "ui.theme.add": scroll_type + "_scroll"
                });
            } else if (!has_scroll && has_class) {
                me.set(container, "ui.property.broadcast", {
                    "ui.theme.remove": scroll_type + "_scroll"
                });
            }
            var scroll_percent = me.ui.scroll.scroll_percent(content, scroll_type);
            var track_region = me.ui.rect.relative_region(object.var.track);
            var thumb_region = me.ui.rect.relative_region(object.var.thumb);
            var position = 0;
            if (scroll_percent) {
                var length = me.ui.scroll.length(scroll_type, track_region, thumb_region);
                position = me.ui.scroll.percent_to_pos(length, scroll_percent);
            }
            me.ui.scroll.set_pos(object.var.thumb, scroll_type, position);
        }
    };
    me.draw = {
        set: function (object, value) {
            me.update.set(object);
        }
    };
    me.before = {
        set: function (object, value) {
            var container = me.ui.node.container(object, me.widget.container.id);
            var content = me.widget.container.content(container);
            me.ui.scroll.by(content, scroll_type, -10);
            me.update.set(object.parentNode);
        }
    };
    me.after = {
        set: function (object, value) {
            var container = me.ui.node.container(object, me.widget.container.id);
            var content = me.widget.container.content(container);
            me.ui.scroll.by(content, scroll_type, 10);
            me.update.set(object.parentNode);
        }
    };
    me.track = {
        set: function (object, value) {
            if (value.target !== object.parentNode.var.track) {
                return;
            }
            var container = me.ui.node.container(object, me.widget.container.id);
            var content = me.widget.container.content(container);
            var thumb_region = me.ui.rect.absolute_region(object.parentNode.var.thumb);
            var scroll_direction = me.ui.scroll.direction(value, scroll_type, thumb_region);
            if (scroll_direction < 0) {
                me.ui.scroll.by(content, scroll_type, -10);
            }
            if (scroll_direction > 0) {
                me.ui.scroll.by(content, scroll_type, 10);
            }
            me.update.set(object.parentNode);
        }
    };
}

package.widget.scrollbar = function WidgetScroll(me) {

};

package.widget.scrollbar.horizontal = WidgetScrollbarTemplate;
package.widget.scrollbar.vertical = WidgetScrollbarTemplate;
