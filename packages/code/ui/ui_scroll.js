/*
 @author Zakai Hamilton
 @component UIScroll
 */

screens.ui.scroll = function UIScroll(me) {
    me.by = function (object, distance) {
        if (object.scrollTop + distance < 0) {
            object.scrollTop = 0;
        } else if (object.scrollTop + distance > object.scrollHeight) {
            object.scrollTop = object.scrollHeight;
        } else {
            object.scrollTop += distance;
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
    me.previousPage = function (object, value) {
        var container = me.container(object);
        me.by(container, -container.ui_scroll_pageSize);
        me.core.property.set(container, "snap");
    };
    me.nextPage = function (object, value) {
        var container = me.container(object);
        me.by(container, container.ui_scroll_pageSize);
        me.core.property.set(container, "snap");
    };
    me.to = function (object, value) {
        var container = me.container(object);
        container.scrollTop = value;
        me.core.property.set(container, "snap");
    };
    me.pageSize = {
        get: function (object) {
            var container = me.container(object);
            return container.ui_scroll_pageSize;
        },
        set: function (object, value) {
            var container = me.container(object);
            container.ui_scroll_pageSize = value;
        }
    };
    me.snap = {
        set: function (object, value) {
            var container = me.container(object);
            var pageSize = container.ui_scroll_pageSize;
            if (container.ui_scroll_snapTimeout) {
                clearTimeout(container.ui_scroll_snapTimeout);
                container.ui_scroll_snapTimeout = null;
            }
            container.ui_scroll_snapTimeout = setTimeout(function () {
                var currentPos = container.scrollTop;
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
                    top: targetPos,
                    behavior: 'smooth'
                };
                container.scroll(params);
            }, 1000);
        }
    };
};
