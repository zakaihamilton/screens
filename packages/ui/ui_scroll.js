/*
 @author Zakai Hamilton
 @component UIScroll
 */

package.ui.scroll = function UIScroll(me) {
    me.has_v_scroll = function(object) {
        return object.scrollHeight > object.clientHeight;
    };
    me.has_h_scroll = function(object) {
        return object.scrollWidth > object.clientWidth;
    };
    me.scroll_v_percent = function(object, pos=object.scrollTop) {
        return me.pos_to_percent(object.scrollHeight - object.clientHeight, pos);
    };
    me.scroll_h_percent = function(object, pos=object.scrollLeft) {
        return me.pos_to_percent(object.scrollWidth - object.clientWidth, pos);
    };
    me.scroll_v_pos = function(object, percent) {
        return me.percent_to_pos(object.scrollHeight - object.clientHeight, percent);
    };
    me.scroll_h_pos = function(object, percent) {
        return me.percent_to_pos(object.scrollWidth - object.clientWidth, percent);
    };
    me.pos_to_percent = function(length, pos) {
        return ((pos / length) * 100);
    };
    me.percent_to_pos = function(length, percent) {
        return (length / 100) * percent;
    };
    me.by = function(object, x, y) {
        if(object.scrollLeft + x < 0) {
            object.scrollLeft = 0;
        }
        else if(object.scrollLeft + x > object.scrollWidth) {
            object.scrollLeft = object.scrollWidth;
        }
        else {
            object.scrollLeft += x;
        }
        if(object.scrollTop + y < 0) {
            object.scrollTop = 0;
        }
        else if(object.scrollTop + y > object.scrollHeight) {
            object.scrollTop = object.scrollHeight;
        }
        else {
            object.scrollTop += y;
        }
    };
    me.scroll_left = function(object, percent) {
        var left = me.scroll_h_pos(object, percent);
        if(left < 0) {
            object.scrollLeft = 0;
        }
        else if(left > object.scrollWidth) {
            object.scrollLeft = object.scrollWidth;
        }
        else {
            object.scrollLeft = left;
        }
    }
    me.scroll_top = function(object, percent) {
        var top = me.scroll_v_pos(object, percent);
        if(top < 0) {
            object.scrollTop = 0;
        }
        else if(top > object.scrollHeight) {
            object.scrollTop = object.scrollHeight;
        }
        else {
            object.scrollTop = top;
        }
    };
    me.overflow = function(object) {
        var members = me.ui.node.members(object, me.widget.window.id);
        var window_region = me.ui.rect.absolute_region(object);
        if(members) {
            members = members.filter(function(member) {
                var member_region = me.ui.rect.absolute_region(member);
                var h_overflow = member_region.left < window_region.left || member_region.right > window_region.right;
                var v_overflow = member_region.top < window_region.top || member_region.bottom > window_region.bottom;
                return h_overflow || v_overflow;
                });
        }
        return members;
    };
    me.thumb = {
        set: function (object, value) {
            object.addEventListener('mousedown', function (e) {
                if(object.getAttribute('disabled')) {
                    e.preventDefault();
                    return;
                }
                var window = me.widget.window.window(object);
                var thumb_region = me.ui.rect.absolute_region(object);
                var info = {
                    target: object,
                    left: e.clientX-thumb_region.left,
                    top: e.clientY-thumb_region.top,
                    width: object.offsetWidth,
                    height: object.offsetHeight
                };
                var scroll_method = function (e) {
                    var track_region = me.ui.rect.absolute_region(object.parentNode);
                    var thumb_region = me.ui.rect.absolute_region(object);
                    if(value === "v") {
                        var length = track_region.height - thumb_region.height;
                        var thumb_pos = (e.clientY - info.top) - track_region.top;
                        var percent = me.pos_to_percent(length, thumb_pos);
                        me.scroll_top(window.var.content, percent);
                    }
                    else if(value === "h") {
                        var length = track_region.width - thumb_region.width;
                        var thumb_pos = (e.clientX - info.left) - track_region.left;
                        var percent = me.pos_to_percent(length, thumb_pos);
                        me.scroll_left(window.var.content, percent);
                    }
                    me.ui.property.notify(info.target, "draw", null);
                };
                var release_method = function (e) {
                    removeEventListener('mousemove', scroll_method);
                    removeEventListener('mouseup', release_method);
                };
                addEventListener('mousemove', scroll_method);
                addEventListener('mouseup', release_method);
                e.preventDefault();
            });
        }
    };
};
