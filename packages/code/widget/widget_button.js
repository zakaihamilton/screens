/*
 @author Zakai Hamilton
 @component WidgetButton
 */

screens.widget.button = function WidgetButton(me, packages) {
    me.element = {
        dependencies: {
            properties: ["ui.basic.text", "ui.touch.click"]
        },
        properties: {
            "ui.class.class": "standard",
            "ui.attribute.tabindex": "0"
        }
    };
};
