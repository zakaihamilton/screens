/*
 @author Zakai Hamilton
 @component WidgetText
 */

package.widget.text = function WidgetText(me) {
    me.depends = {
        properties:["ui.element.text"]
    };
    me.type = "div";
    me.set_text = function(object, value) {
        object.innerHTML = value;
    };
    me.get_text = function(object) {
        return object.innerHTML;
    };
};
