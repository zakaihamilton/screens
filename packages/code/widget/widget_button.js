/*
 @author Zakai Hamilton
 @component WidgetButton
 */

screens.widget.button = function WidgetButton(me) {
    me.dependencies = {
        properties:["ui.basic.text","ui.touch.click"]
    };
    me.properties = {
        "ui.class.class" : "standard",
        "ui.attribute.tabindex":"0"
    };
};
