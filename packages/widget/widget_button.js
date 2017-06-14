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
    me.text = {
        get : function(object) {
            return object.innerHTML;
        },
        set : function(object, value) {
            object.innerHTML = value;
        }
    };
};
