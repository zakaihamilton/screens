/*
 @author Zakai Hamilton
 @component UIButton
 */

package.widget.button = function WidgetButton(me) {
    me.depends = {
        properties:["ui.basic.text","ui.event.click"]
    };
    me.default = {
        "ui.basic.tag" : "div",
        "ui.theme.class" : "standard"
    };
};
