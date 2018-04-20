/*
 @author Zakai Hamilton
 @component UIModal
 */

screens.widget.modal = function WidgetModal(me) {
    me.element = {
        properties : {
            "ui.touch.click": "click",
            "ui.class.class": "overlay"
        }
    };
    me.click = {
        set: function (object, value) {
            me.core.property.set(object.parentNode, "back");
            value.stopPropagation();
        }
    };
};
