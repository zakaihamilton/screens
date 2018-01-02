/*
 @author Zakai Hamilton
 @component UIButton
 */

package.widget.button = function WidgetButton(me) {
    me["ui.element.depends"] = {
        properties:["ui.basic.text","ui.touch.click"]
    };
    me["ui.element.default"] = {
        "ui.class.class" : "standard",
        "ui.attribute.tabindex":"0"
    };
};
