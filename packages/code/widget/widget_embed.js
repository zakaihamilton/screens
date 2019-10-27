/*
 @author Zakai Hamilton
 @component WidgetEmbed
 */

screens.widget.embed = function WidgetEmbed(me, { core }) {
    me.element = {
        properties: {
            "ui.basic.tag": "iframe",
            "ui.class.class": "iframe"
        }
    };
    me.transition = {
        set: function (object, value) {
            if (value) {
                core.property.set(object, "ui.class.add", "transition");
            }
            else {
                core.property.set(object, "ui.class.remove", "transition");
            }
        }
    };
};
