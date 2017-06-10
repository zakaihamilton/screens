/*
 @author Zakai Hamilton
 @component WidgetHeader
 */

package.widget.header = function WidgetHeader(me) {
    me.depends = {
        parent:["widget.screen"],
        properties:["ui.element.text"]
    };
    me.type="header";
    me.set_text = function(object, value) {
        object.innerHTML = value;
    };
    me.get_text = function(object) {
        return object.innerHTML;
    };
};
