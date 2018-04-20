/*
 @author Zakai Hamilton
 @component WidgetText
 */

screens.widget.text = function WidgetText(me) {
    me.element = {
        dependencies : {
            properties: ["ui.basic.text"]
        },
        properties : {
            "ui.class.class": "normal"
        }
    };
};
