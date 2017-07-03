/*
 @author Zakai Hamilton
 @component UIModal
 */

package.widget.modal = function WidgetModal(me) {
    me.default = {
        "ui.basic.tag" : "div",
        "ui.event.click":"widget.modal.click",
        "ui.theme.class" : "widget.modal.overlay"
    };
    me.click = {
        set: function(object, value) {
            me.set(object.parentNode, "back", value);
            value.stopPropagation();
        }
    };
};
