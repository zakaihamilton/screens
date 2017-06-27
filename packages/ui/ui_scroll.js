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
        return pos / (object.scrollHeight - object.clientHeight) * 100;
    };
    me.scroll_h_percent = function(object, pos=object.scrollLeft) {
        return pos / (object.scrollWidth - object.clientWidth) * 100;
    };
    me.scroll_v_pos = function(object, percent=me.scroll_v_percent(object)) {
        return percent * (object.scrollHeight - object.clientHeight) / 100;
    };
    me.scroll_h_pos = function(object, percent=me.scroll_h_percent(object)) {
        return percent * (object.scrollWidth - object.clientWidth) / 100;
    };
    me.by = function(object, x, y) {
        var width = (object.scrollWidth - object.clientWidth);
        var height = (object.scrollHeight - object.clientHeight);
        if(object.scrollLeft + x < 0) {
            object.scrollLeft = 0;
        }
        else if(object.scrollLeft + x > object.scrollWidth) {
            object.scrollLeft = object.scrollWidth;
        }
        else {
            object.scrollLeft += x;
        }
        if(object.scrollTop + x < 0) {
            object.scrollTop = 0;
        }
        else if(object.scrollTop + y > object.scrollHeight) {
            object.scrollTop = object.scrollHeight;
        }
        else {
            object.scrollTop += y;
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
};
