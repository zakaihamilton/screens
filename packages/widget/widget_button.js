/*
 @author Zakai Hamilton
 @component UIButton
 */

package.widget.button = function WidgetButton(me) {
    me.class = "widget.button.standard";
    me.depends = {
        properties:["ui.basic.text","ui.event.click"]
    };
    me.default = {
        "ui.basic.tag" : "button"
    };
};
