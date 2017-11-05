/*
 @author Zakai Hamilton
 @component WidgetEmbed
 */

package.widget.embed = function WidgetEmbed(me) {
    me.default = {
        "ui.basic.tag": "iframe",
        "ui.class.class": "iframe"
    };
    me.transition = {
        set: function(object, value) {
            if(value) {
                me.the.core.property.set(object, "ui.class.add", "transition");
            }
            else {
                me.the.core.property.set(object, "ui.class.remove", "transition");
            }
        }
    };
};
