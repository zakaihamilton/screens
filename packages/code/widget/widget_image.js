/*
 @author Zakai Hamilton
 @component WidgetImage
 */

screens.widget.image = function WidgetImage(me) {
    me.element = {
        dependencies: {
            properties: ["ui.basic.src"]
        },
        properties: {
            "ui.basic.tag": "img"
        }
    };
};
