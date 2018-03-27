/*
 @author Zakai Hamilton
 @component WidgetScrollbar
 */

function WidgetScrollbarTemplate(me, scroll_type) {
    me.properties = __json__;
    me.create = function (object) {
        object.autoScrollSpeed = 250;
        object.autoScrollSize = 1;
        object.deltaSpeed = 25;
        object.snapToScrollWait = 500;
        object.snapToPageUnits = 50;
        object.scrollSize = 10;
        object.delayTimeout = 10;
        object.deltaDistance = 0;
        object.has_scroll = false;
    };
    me.scrollType = {
        get: function (object) {
            return scroll_type;
        }
    };
    me.container = function (object) {
        var container = null;
        if (object.component === me.widget.window.id) {
            container = object.var.container;
        } else {
            container = me.ui.node.container(object, me.widget.container.id);
        }
        return container;
    };
    me.alwaysShow = {
        get: function (object) {
            var container = me.container(object);
            var scrollbar = container.var[scroll_type];
            return scrollbar.alwaysShow;
        },
        set: function (object, value) {
            var container = me.container(object);
            var scrollbar = container.var[scroll_type];
            scrollbar.alwaysShow = value;
        }
    };
    me.alwaysHide = {
        get: function (object) {
            var container = me.container(object);
            var scrollbar = container.var[scroll_type];
            return scrollbar.alwaysHide;
        },
        set: function (object, value) {
            var container = me.container(object);
            var scrollbar = container.var[scroll_type];
            scrollbar.alwaysHide = value;
        }
    };
    me.remove_scroll_class = function (container, scroll_type) {
        var scrollbar = container.var[scroll_type];
        if (!scrollbar) {
            return;
        }
        var has_class = me.core.property.get(container, "ui.class.contains", scroll_type + "_scroll");
        var class_name = scroll_type + "_scroll";
        if (has_class) {
            me.core.property.set(container, "ui.class.remove", class_name);
            me.core.property.set(container.var.vertical, "ui.property.broadcast", {
                "ui.class.remove": class_name
            });
            me.core.property.set(container.var.footer, "ui.property.broadcast", {
                "ui.class.remove": class_name
            });
            me.core.property.set(container, "ui.scroll.swipe", "");
        }
    };
    me.update_scroll_class = function (container, scroll_type) {
        var scrollbar = container.var[scroll_type];
        if (!scrollbar) {
            return;
        }
        var content = me.widget.container.content(container);
        var has_scroll = (me.ui.scroll.has_scroll(content, scroll_type) || scrollbar.alwaysShow) && !scrollbar.alwaysHide;
        has_scroll = has_scroll && !me.widget.container.isChild(container);
        var class_name = scroll_type + "_scroll";
        if (has_scroll) {
            me.core.property.set(container, "ui.class.add", class_name);
            me.core.property.set(container.var.vertical, "ui.property.broadcast", {
                "ui.class.add": class_name
            });
            me.core.property.set(container.var.footer, "ui.property.broadcast", {
                "ui.class.add": class_name
            });
            if(me.core.device.isMobile()) {
                me.core.property.set(container, "ui.scroll.swipe", "vertical");
            }
        }
    };
    me.update = {
        set: function (object) {
            var container = me.container(object);
            var scrollbar = container.var[scroll_type];
            var content = me.widget.container.content(container);
            var has_scroll = (me.ui.scroll.has_scroll(content, scroll_type) || scrollbar.alwaysShow) && !scrollbar.alwaysHide;
            if (scrollbar.has_scroll !== has_scroll) {
                me.remove_scroll_class(container, scroll_type);
                me.update_scroll_class(container, scroll_type);
                me.core.property.set(scrollbar, "ui.style.visibility", has_scroll ? "visible" : "hidden");
                scrollbar.has_scroll = has_scroll;
            }
            var has_scroll = me.ui.scroll.has_scroll(content, scroll_type);
            var scroll_percent = me.ui.scroll.scroll_percent(content, scroll_type);
            var thumb_percent = me.ui.scroll.thumb_percent(content, scroll_type);
            var track_region = me.ui.rect.relative_region(scrollbar.var.track);
            var thumb_region = me.ui.rect.relative_region(scrollbar.var.thumb);
            var position = 0, size = 0;
            if (scroll_percent) {
                var scrollSize = me.ui.scroll.size(scroll_type, track_region, thumb_region);
                position = me.ui.scroll.percent_to_pos(scrollSize, scroll_percent);
            }
            if (thumb_percent) {
                size = me.ui.scroll.size(scroll_type, track_region, null);
                size = me.ui.scroll.percent_to_pos(size, thumb_percent);
            }
            if (has_scroll) {
                me.ui.scroll.set_size(scrollbar.var.thumb, scroll_type, size);
            }
            me.ui.scroll.set_pos(scrollbar.var.thumb, scroll_type, position);
            var current_pos = me.ui.scroll.current_pos(content, scroll_type);
            if (current_pos !== scrollbar.prev_pos) {
                scrollbar.prev_pos = current_pos;
                var scrolledInfo = {};
                scrolledInfo[scroll_type] = current_pos;
                me.core.property.set(container, "scrolled", scrolledInfo);
            }
        }
    };
    me.refresh = {
        set: function (object) {
            me.update.set(object);
            me.update.set(object);
        }
    };
    me.draw = {
        set: function (object, value) {
            me.refresh.set(object);
        }
    };
    me.before = {
        set: function (object, value) {
            var container = me.container(object);
            var content = me.widget.container.content(container);
            var scrollbar = container.var[scroll_type];
            var scrollSize = scrollbar.scrollSize;
            if (scrollbar.snapToPage) {
                scrollSize = scrollbar.pageSize;
            }
            me.ui.scroll.by(content, scroll_type, -scrollSize);
            me.refresh.set(container);
            me.core.property.set(scrollbar, "snap");
        }
    };
    me.after = {
        set: function (object, value) {
            var container = me.container(object);
            var content = me.widget.container.content(container);
            var scrollbar = container.var[scroll_type];
            var scrollSize = scrollbar.scrollSize;
            if (scrollbar.snapToPage) {
                scrollSize = scrollbar.pageSize;
            }
            me.ui.scroll.by(content, scroll_type, scrollSize);
            me.refresh.set(container);
            me.core.property.set(scrollbar, "snap");
        }
    };
    me.scrollTo = {
        get: function (object) {
            var container = me.container(object);
            var content = me.widget.container.content(container);
            return me.ui.scroll.current_pos(content, scroll_type);
        },
        set: function (object, value) {
            var container = me.container(object);
            var content = me.widget.container.content(container);
            me.ui.scroll.set_current_pos(content, scroll_type, value);
            me.refresh.set(container);
        }
    };
    me.track = {
        set: function (object, value) {
            if (!object.parentNode || value.target !== object.parentNode.var.track) {
                return;
            }
            var container = me.container(object);
            var content = me.widget.container.content(container);
            var thumb_region = me.ui.rect.absolute_region(object.parentNode.var.thumb);
            var scroll_direction = me.ui.scroll.direction(value, scroll_type, thumb_region);
            var scrollbar = container.var[scroll_type];
            var scrollSize = scrollbar.scrollSize;
            if (scrollbar.snapToPage) {
                scrollSize = scrollbar.pageSize;
            }
            if (scroll_direction < 0) {
                me.ui.scroll.by(content, scroll_type, 0 - scrollSize);
            }
            if (scroll_direction > 0) {
                me.ui.scroll.by(content, scroll_type, scrollSize);
            }
            me.refresh.set(container);
            me.core.property.set(scrollbar, "snap");
        }
    };
    me.autoScroll = {
        get: function (object) {
            return object.autoScrollTimer !== null;
        },
        set: function (object, value) {
            var container = me.container(object);
            var scrollbar = container.var[scroll_type];
            if (object.autoScrollTimer) {
                clearInterval(object.autoScrollTimer);
                object.autoScrollTimer = null;
            }
            if (value) {
                object.autoScrollTimer = setInterval(function () {
                    var window = me.widget.window(object);
                    var hasParent = me.core.property.get(window, "ui.node.parent");
                    if (!hasParent) {
                        clearInterval(object.autoScrollTimer);
                        return;
                    }
                    if (!me.core.property.get(window, "visible")) {
                        return;
                    }
                    var container = me.container(object);
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
            var container = me.container(object);
            var content = me.widget.container.content(container);
            var scrollbar = container.var[scroll_type];
            scrollbar.deltaDistance += value;
            if (scrollbar.delta_timer) {
                return;
            }
            scrollbar.delta_timer = setTimeout(function () {
                me.ui.scroll.by(content, scroll_type, scrollbar.deltaDistance);
                me.refresh.set(container);
                me.core.property.set(scrollbar, "snap");
                scrollbar.deltaDistance = 0;
                scrollbar.delta_timer = null;
            }, scrollbar.delayTimeout);
        }
    };
    me.snap = {
        set: function (object, value) {
            var container = me.container(object);
            var content = me.widget.container.content(container);
            var scrollbar = container.var[scroll_type];
            if (!scrollbar.snapToPage) {
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
                if (delta) {
                    targetPos = Math.round(currentPos / pageSize) * pageSize;
                }
                if (currentPos < targetPos) {
                    direction = 1;
                } else if (currentPos > targetPos) {
                    direction = -1;
                }
                scrollbar.deltaInterval = setInterval(function () {
                    currentPos = me.ui.scroll.current_pos(content, scroll_type);
                    var scrollBy = 0;
                    if (direction > 0) {
                        scrollBy = scrollbar.snapToPageUnits;
                        if (currentPos + scrollBy > targetPos) {
                            scrollBy = targetPos - currentPos;
                        }
                    } else if (direction < 0) {
                        scrollBy = 0 - scrollbar.snapToPageUnits;
                        if (currentPos + scrollBy < targetPos) {
                            scrollBy = targetPos - currentPos;
                        }
                    }
                    if (scrollBy) {
                        me.ui.scroll.by(content, scroll_type, scrollBy);
                        me.refresh.set(container);
                    } else {
                        clearInterval(scrollbar.deltaInterval);
                        scrollbar.deltaInterval = null;
                    }
                }, scrollbar.deltaSpeed);
            }, scrollbar.snapToScrollWait);
        }
    };
}

screens.widget.scrollbar = function WidgetScroll(me) {

};

screens.widget.scrollbar.horizontal = WidgetScrollbarTemplate;
screens.widget.scrollbar.vertical = WidgetScrollbarTemplate;
