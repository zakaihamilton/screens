/*
 @author Zakai Hamilton
 @component WidgetEmbed
 */

screens.widget.embed = function WidgetEmbed(me) {
    me.element = {
        properties: {
            "ui.basic.tag": "iframe",
            "ui.class.class": "iframe"
        }
    };
    me.transition = {
        set: function (object, value) {
            if (value) {
                me.core.property.set(object, "ui.class.add", "transition");
            }
            else {
                me.core.property.set(object, "ui.class.remove", "transition");
            }
        }
    };
};
