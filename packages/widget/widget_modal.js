/*
 @author Zakai Hamilton
 @component UIModal
 */

package.widget.modal = function WidgetModal(me) {
    me.default = {
        "ui.touch.click":"click",
        "ui.theme.class" : "overlay"
    };
    me.click = {
        set: function(object, value) {
            me.set(object.parentNode, "back");
            value.stopPropagation();
        }
    };
};
