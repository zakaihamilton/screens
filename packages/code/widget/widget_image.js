/*
 @author Zakai Hamilton
 @component WidgetImage
 */

screens.widget.image = function WidgetImage(me) {
    me.dependencies = {
        properties:["ui.basic.src"]
    };
    me.properties = {
        "ui.basic.tag" : "img"
    };
};
