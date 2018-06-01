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
    me.content = function (object) {
        var container = null;
        if (object.component === me.widget.window.id) {
            container = object.var.container;
        } else {
            container = me.ui.node.container(object, me.widget.container.id);
        }
        var content = me.widget.container.content(container);
        return content;
    };
    me.previousPage = function (object, value) {
        var content = me.content(object);
        me.by(content, -content.ui_scroll_pageSize);
        me.core.property.set(content, "snap");
    };
    me.nextPage = function (object, value) {
        var content = me.content(object);
        me.by(content, content.ui_scroll_pageSize);
        me.core.property.set(content, "snap");
    };
    me.to = function (object, value) {
        var content = me.content(object);
        content.scrollTop = value;
        me.core.property.set(content, "snap");
    };
    me.pageSize = {
        get: function (object) {
            var content = me.content(object);
            return content.ui_scroll_pageSize;
        },
        set: function (object, value) {
            var content = me.content(object);
            content.ui_scroll_pageSize = value;
        }
    };
    me.snap = {
        set: function (object, value) {
            var content = me.content(object);
            var pageSize = content.ui_scroll_pageSize;
            if (content.ui_scroll_snapTimeout) {
                clearTimeout(content.ui_scroll_snapTimeout);
                content.ui_scroll_snapTimeout = null;
            }
            content.ui_scroll_snapTimeout = setTimeout(function () {
                var currentPos = content.scrollTop;
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
                content.scroll(params);
            }, 1000);
        }
    };
};
