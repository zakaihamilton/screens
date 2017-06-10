/*
 @author Zakai Hamilton
 @component UIButton
 */

package.widget.button = function WidgetButton(me) {
    me.class = "widget.button.standard";
    me.depends = {
        properties:["ui.element.text","ui.event.pressed"]
    };
    me.type = "button";
    me.set_text = function(object, value) {
        object.innerHTML = value;
    };
    me.get_text = function(object) {
        return object.innerHTML;
    };
};
