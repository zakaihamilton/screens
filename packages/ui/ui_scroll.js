/*
 @author Zakai Hamilton
 @component UIScroll
 */

package.ui.scroll = function UIScroll(me) {
    me.has_vertical_scroll = function(object) {
        console.log("scrollHeight: " + object.scrollHeight + " clientHeight: " + object.clientHeight);
        return object.scrollHeight > object.clientHeight;
    };
    me.has_horizontal_scroll = function(object) {
        return object.scrollWidth > object.clientWidth;
    };
};
