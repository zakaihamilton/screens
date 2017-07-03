/*
 @author Zakai Hamilton
 @component WidgetText
 */

package.widget.text = function WidgetText(me) {
    me.depends = {
        properties:["ui.basic.text"]
    };
    me.default = {
        "ui.basic.tag" : "div",
        "ui.theme.class":"widget.text.normal"
    };
};
