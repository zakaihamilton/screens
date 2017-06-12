/*
 @author Zakai Hamilton
 @component UIButton
 */

package.widget.button = function WidgetButton(me) {
    me.class = "widget.button.standard";
    me.depends = {
        properties:["text","ui.event.pressed"]
    };
    me.tag_name = "button";
    me.set_text = function(object, value) {
        object.innerHTML = value;
    };
    me.get_text = function(object) {
        return object.innerHTML;
    };
};
