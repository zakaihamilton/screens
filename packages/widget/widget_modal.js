/*
 @author Zakai Hamilton
 @component UIModal
 */

package.widget.modal = function WidgetModel(me) {
    me.class=["widget.modal.overlay"];
    me.default = {
        "ui.basic.tag" : "div",
        "ui.event.click":"widget.modal.click"
    };
    me.click = {
        set: function(object, value) {
            me.ui.element.set(object.parentNode, "back", value);
            value.stopPropagation();
        }
    };
};
