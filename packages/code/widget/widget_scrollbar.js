/*
 @author Zakai Hamilton
 @component WidgetScrollbar
 */

function WidgetScrollbarTemplate(me, scroll_type) {
    me.element = {
        properties: __json__,
        create: function (object) {
            object.autoScrollSpeed = 250;
            object.autoScrollSize = 1;
            object.snapToScrollWait = 1000;
            object.scrollSize = 10;
            object.delayTimeout = 10;
            object.has_scroll = false;
        }
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
            me.core.property.set(scrollbar, "snap");
        }
    };
    me.scroll = function (object) {
        var container = me.container(object);
        var scrollbar = container.var[scroll_type];
        me.core.property.set(scrollbar, "snap");
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
    me.snap = {
        set: function (object, value) {
            var container = me.container(object);
            var content = me.widget.container.content(container);
            var scrollbar = container.var[scroll_type];
            if (!scrollbar.snapToPage) {
                return;
            }
            var pageSize = scrollbar.pageSize;
            if (scrollbar.snapTimeout) {
                clearTimeout(scrollbar.snapTimeout);
                scrollbar.snapTimeout = null;
            }
            scrollbar.snapTimeout = setTimeout(function () {
                var currentPos = me.ui.scroll.current_pos(content, scroll_type);
                var targetPos = currentPos;
                var delta = currentPos % pageSize;
                var direction = 0;
                if (delta && currentPos) {
                    targetPos = Math.round(currentPos / pageSize) * pageSize;
                }
                if (currentPos < targetPos) {
                    direction = 1;
                } else if (currentPos > targetPos) {
                    direction = -1;
                }
                var scroll_key = {
                    horizontal: "left",
                    vertical: "top"
                };
                var params = {
                    behavior: 'smooth'
                };
                params[scroll_key[scroll_type]] = targetPos;
                content.scroll(params);
            }, scrollbar.snapToScrollWait);
        }
    };
}

screens.widget.scrollbar = function WidgetScroll(me) {

};

screens.widget.scrollbar.vertical = WidgetScrollbarTemplate;
