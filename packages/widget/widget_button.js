/*
 @author Zakai Hamilton
 @component UIButton
 */

package.widget.button = function WidgetButton(me) {
    me.depends = {
        properties:["ui.basic.text","ui.touch.click"]
    };
    me.default = {
        "ui.class.class" : "standard"
    };
};
