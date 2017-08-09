/*
 @author Zakai Hamilton
 @component WidgetScrollbar
 */

function WidgetScrollbarTemplate(me, scroll_type) {
    me.default = __json__;
    me.create = {
        set: function (object) {
            object.autoScrollSpeed = 250;
            object.autoScrollSize = 1;
            object.deltaSpeed = 50;
            object.snapToScrollWait = 150;
            object.snapToPageUnits = 50;
            object.scrollSize = 10;
            object.delayTimeout = 0;
            object.deltaDistance = 0;
        }
    };
    me.scrollType = {
        get: function (object) {
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
            var class_name = scroll_type + "_scroll";
            if (has_scroll && !has_class) {
                me.set(container, "ui.theme.add", class_name);
                me.set(container.var.vertical, "ui.property.trickle", {
                    "ui.theme.add": class_name
                });
                me.set(container.var.footer, "ui.property.trickle", {
                    "ui.theme.add": class_name
                });
            } else if (!has_scroll && has_class) {
                me.set(container, "ui.theme.remove", class_name);
                me.set(container.var.vertical, "ui.property.trickle", {
                    "ui.theme.remove": class_name
                });
                me.set(container.var.footer, "ui.property.trickle", {
                    "ui.theme.remove": class_name
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
            var changed = me.ui.scroll.set_pos(scrollbar.var.thumb, scroll_type, position);
            if(changed) {
                var scrolledInfo = {};
                scrolledInfo[scroll_type] = me.ui.scroll.current_pos(content, scroll_type);
                me.set(container, "scrolled", scrolledInfo);
            }
        }
    };
    me.refresh = {
        set: function(object) {
            var container = me.ui.node.container(object, me.widget.container.id);
            var scrollbar = container.var[scroll_type];
            if(scrollbar.refresh_timer) {
                clearTimeout(scrollbar.refresh_timer);
            }
            scrollbar.refresh_timer = setTimeout(function() {
                me.update.set(object);
                me.update.set(object);
            }, scrollbar.delayTimeout);
        }
    };
    me.draw = {
        set: function (object, value) {
            me.refresh.set(object);
        }
    };
    me.before = {
        set: function (object, value) {
            var container = me.ui.node.container(object, me.widget.container.id);
            var content = me.widget.container.content(container);
            var scrollbar = container.var[scroll_type];
            var scrollSize = scrollbar.scrollSize;
            if(scrollbar.snapToPage) {
                scrollSize = scrollbar.pageSize;
            }
            me.ui.scroll.by(content, scroll_type, -scrollSize);
            me.refresh.set(container);
            me.set(scrollbar, "snap");
        }
    };
    me.after = {
        set: function (object, value) {
            var container = me.ui.node.container(object, me.widget.container.id);
            var content = me.widget.container.content(container);
            var scrollbar = container.var[scroll_type];
            var scrollSize = scrollbar.scrollSize;
            if(scrollbar.snapToPage) {
                scrollSize = scrollbar.pageSize;
            }
            me.ui.scroll.by(content, scroll_type, scrollSize);
            me.refresh.set(container);
            me.set(scrollbar, "snap");
        }
    };
    me.scrollTo = {
        get: function (object) {
            var container = me.ui.node.container(object, me.widget.container.id);
            var content = me.widget.container.content(container);
            return me.ui.scroll.current_pos(content, scroll_type);
        },
        set: function (object, value) {
            var container = me.ui.node.container(object, me.widget.container.id);
            var content = me.widget.container.content(container);
            me.ui.scroll.set_current_pos(content, scroll_type, value);
            me.refresh.set(container);
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
            var scrollbar = container.var[scroll_type];
            var scrollSize = scrollbar.scrollSize;
            if(scrollbar.snapToPage) {
                scrollSize = scrollbar.pageSize;
            }
            if (scroll_direction < 0) {
                me.ui.scroll.by(content, scroll_type, 0 - scrollSize);
            }
            if (scroll_direction > 0) {
                me.ui.scroll.by(content, scroll_type, scrollSize);
            }
            me.refresh.set(container);
            me.set(scrollbar, "snap");
        }
    };
    me.autoScroll = {
        get: function (object) {
            return object.autoScrollTimer !== null;
        },
        set: function (object, value) {
            var container = me.ui.node.container(object, me.widget.container.id);
            var scrollbar = container.var[scroll_type];
            if (object.autoScrollTimer) {
                clearInterval(object.autoScrollTimer);
                object.autoScrollTimer = null;
            }
            if (value) {
                object.autoScrollTimer = setInterval(function () {
                    var window = me.widget.window.window(object);
                    var hasParent = me.get(window, "ui.node.parent");
                    if (!hasParent) {
                        clearInterval(object.autoScrollTimer);
                        return;
                    }
                    if (!me.get(window, "visible")) {
                        return;
                    }
                    var container = me.ui.node.container(object, me.widget.container.id);
                    var content = me.widget.container.content(container);
                    me.ui.scroll.by(content, scroll_type, scrollbar.autoScrollSize);
                    me.refresh.set(container);
                }, scrollbar.autoScrollSpeed);
            }
        }
    };
    me.pageSize = {
        get: function (object) {
            return object.pageSize;
        },
        set: function (object, value) {
            object.pageSize = value;
        }
    };
    me.snapToPage = {
        get: function (object) {
            return object.snapToPage;
        },
        set: function (object, value) {
            object.snapToPage = value;
        }
    };
    me.scrollSize = {
        get: function (object) {
            return object.scrollSize;
        },
        set: function (object, value) {
            object.scrollSize = value;
        }
    };
    me.autoScrollSpeed = {
        get: function (object) {
            return object.autoScrollSpeed;
        },
        set: function (object, value) {
            object.autoScrollSpeed = value;
        }
    };
    me.delta = {
        set: function (object, value) {
            var container = me.ui.node.container(object, me.widget.container.id);
            var content = me.widget.container.content(container);
            var scrollbar = container.var[scroll_type];
            var distance = 0 - (value * 10);
            scrollbar.deltaDistance += distance;
            if(scrollbar.delta_timer) {
                clearTimeout(scrollbar.delta_timer);
            }
            scrollbar.delta_timer = setTimeout(function() {
                me.ui.scroll.by(content, scroll_type, scrollbar.deltaDistance);
                me.refresh.set(container);
                me.set(scrollbar, "snap");
                scrollbar.deltaDistance = 0;
            }, scrollbar.delayTimeout);
        }
    };
    me.snap = {
        set: function(object, value) {
            var container = me.ui.node.container(object, me.widget.container.id);
            var content = me.widget.container.content(container);
            var scrollbar = container.var[scroll_type];
            if(!scrollbar.snapToPage) {
                return;
            }
            var pageSize = scrollbar.pageSize;
            if (scrollbar.deltaTimeout) {
                clearTimeout(scrollbar.deltaTimeout);
                scrollbar.deltaTimeout = null;
            }
            if (scrollbar.deltaInterval) {
                clearInterval(scrollbar.deltaInterval);
                scrollbar.deltaInterval = null;
            }
            scrollbar.deltaTimeout = setTimeout(function () {
                var currentPos = me.ui.scroll.current_pos(content, scroll_type);
                var targetPos = currentPos;
                var delta = currentPos % pageSize;
                var direction = 0;
                if(delta) {
                    targetPos = Math.round(currentPos / pageSize) * pageSize;
                }
                if(currentPos < targetPos) {
                    direction = 1;
                }
                else if(currentPos > targetPos) {
                    direction = -1;
                }
                scrollbar.deltaInterval = setInterval(function () {
                    currentPos = me.ui.scroll.current_pos(content, scroll_type);
                    var scrollBy = 0;
                    if(direction > 0) {
                        scrollBy = scrollbar.snapToPageUnits;
                        if(currentPos + scrollBy > targetPos) {
                            scrollBy = targetPos - currentPos;
                        }
                    }
                    else if(direction < 0) {
                        scrollBy = 0 - scrollbar.snapToPageUnits;
                        if(currentPos + scrollBy < targetPos) {
                            scrollBy = targetPos - currentPos;
                        }
                    }
                    if(scrollBy) {
                        me.ui.scroll.by(content, scroll_type, scrollBy);
                        me.refresh.set(container);
                    }
                    else {
                        clearInterval(scrollbar.deltaInterval);
                        scrollbar.deltaInterval = null;
                    }
                }, scrollbar.deltaSpeed);
            }, scrollbar.snapToScrollWait);
        }
    };
}

package.widget.scrollbar = function WidgetScroll(me) {

};

package.widget.scrollbar.horizontal = WidgetScrollbarTemplate;
package.widget.scrollbar.vertical = WidgetScrollbarTemplate;
