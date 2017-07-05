/*
 @author Zakai Hamilton
 @component UIButton
 */

package.widget.button = function WidgetButton(me) {
    me.depends = {
        properties:["ui.basic.text","ui.touch.click"]
    };
    me.default = {
        "ui.theme.class" : "standard"
    };
};
