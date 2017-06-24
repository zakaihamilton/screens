/*
 @author Zakai Hamilton
 @component WidgetScrollbar
 */

package.widget.scrollbar = function WidgetScrollbar(me) {

};

package.widget.scrollbar.horizontal = function WidgetScrollbarVertical(me) {
    me.class = "widget.scrollbar.vertical";
    me.default = {
        "ui.basic.tag": "div"
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
    me.moved = {
        set: function (object, value) {
            me.update(object);
        }
    };
    me.resized = {
        set: function (object, value) {
            me.update(object);
        }
    };
};

package.widget.scrollbar.vertical = function WidgetScrollbarHorizontal(me) {
    me.class = "widget.scrollbar.horizontal";
    me.default = {
        "ui.basic.tag": "div"
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
    me.moved = {
        set: function (object, value) {
            me.update(object);
        }
    };
    me.resized = {
        set: function (object, value) {
            me.update(object);
        }
    };
};
