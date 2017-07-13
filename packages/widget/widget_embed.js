/*
 @author Zakai Hamilton
 @component WidgetEmbed
 */

package.widget.embed = function WidgetEmbed(me) {
    me.default = {
        "ui.basic.tag": "iframe",
        "ui.theme.class": "iframe"
    };
    me.transition = {
        set: function(object, value) {
            if(value) {
                me.set(object, "ui.theme.add", "transition");
            }
            else {
                me.set(object, "ui.theme.remove", "transition");
            }
        }
    };
};
