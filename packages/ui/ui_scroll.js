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
