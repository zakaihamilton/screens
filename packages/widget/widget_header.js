/*
 @author Zakai Hamilton
 @component WidgetHeader
 */

package.widget.header = function WidgetHeader(me) {
    me.depends = {
        parent:["widget.screen"],
        properties:["ui.basic.text"]
    };
    me.default = {
        "ui.basic.tag" : "header"
    };
};
