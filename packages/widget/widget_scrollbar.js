/*
 @author Zakai Hamilton
 @component WidgetScrollbar
 */

function WidgetScrollbarTemplate(me, scroll_type) {
    me.default = __json__;
    me.scrollType = {
        get: function(object) {
            return scroll_type;
        }
    };
    me.update = {
        set: function (object) {
            var container = me.ui.node.container(object, me.widget.container.id);
            var scrollbar = container.var[scroll_type];
            var content = me.widget.container.content(container);
            var has_scroll = me.ui.scroll.has_scroll(content, scroll_type);
            var has_class = me.get(container, "ui.theme.contains", scroll_type + "_scroll");
            if (has_scroll && !has_class) {
                me.set(container, "ui.property.trickle", {
                    "ui.theme.add": scroll_type + "_scroll"
                });
            } else if (!has_scroll && has_class) {
                me.set(container, "ui.property.trickle", {
                    "ui.theme.remove": scroll_type + "_scroll"
                });
            }
            var scroll_percent = me.ui.scroll.scroll_percent(content, scroll_type);
            var track_region = me.ui.rect.relative_region(scrollbar.var.track);
            var thumb_region = me.ui.rect.relative_region(scrollbar.var.thumb);
            var position = 0;
            if (scroll_percent) {
                var length = me.ui.scroll.length(scroll_type, track_region, thumb_region);
                position = me.ui.scroll.percent_to_pos(length, scroll_percent);
            }
            me.ui.scroll.set_pos(scrollbar.var.thumb, scroll_type, position);
        }
    };
    me.draw = {
        set: function (object, value) {
            setTimeout( function() {
                me.update.set(object);
                me.update.set(object);
            }, 0);
        }
    };
    me.before = {
        set: function (object, value) {
            var container = me.ui.node.container(object, me.widget.container.id);
            var content = me.widget.container.content(container);
            me.ui.scroll.by(content, scroll_type, -10);
            me.update.set(container);
        }
    };
    me.after = {
        set: function (object, value) {
            var container = me.ui.node.container(object, me.widget.container.id);
            var content = me.widget.container.content(container);
            me.ui.scroll.by(content, scroll_type, 10);
            me.update.set(container);
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
    me.autoScroll = {
        get: function (object) {
            return object.autoScrollTimer!==null;
        },
        set: function (object, value) {
            if(object.autoScrollTimer) {
                clearInterval(object.autoScrollTimer);
                object.autoScrollTimer = null;
            }
            if(value) {
                object.autoScrollTimer = setInterval(function() {
                    var window = me.widget.window.window(object);
                    var hasParent = me.get(window, "ui.node.parent");
                    if (!hasParent) {
                        clearInterval(object.autoScrollTimer);
                        return;
                    }
                    if(!me.get(window, "visible")) {
                        return;
                    }
                    var container = me.ui.node.container(object, me.widget.container.id);
                    var content = me.widget.container.content(container);
                    me.ui.scroll.by(content, scroll_type, 1);
                    me.update.set(container);
                }, 150);
            }
        }
    };
}

package.widget.scrollbar = function WidgetScroll(me) {

};

package.widget.scrollbar.horizontal = WidgetScrollbarTemplate;
package.widget.scrollbar.vertical = WidgetScrollbarTemplate;
