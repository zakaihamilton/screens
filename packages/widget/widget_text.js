/*
 @author Zakai Hamilton
 @component WidgetText
 */

package.widget.text = function WidgetText(me) {
    me.depends = {
        properties:["ui.basic.text"]
    };
    me["ui.element.default"] = {
        "ui.class.class":"normal"
    };
};
