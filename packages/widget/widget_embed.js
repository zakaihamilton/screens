/*
 @author Zakai Hamilton
 @component WidgetEmbed
 */

package.widget.embed = function WidgetEmbed(me) {
    me["ui.element.default"] = {
        "ui.basic.tag": "iframe",
        "ui.class.class": "iframe"
    };
    me.transition = {
        set: function(object, value) {
            if(value) {
                me.package.core.property.set(object, "ui.class.add", "transition");
            }
            else {
                me.package.core.property.set(object, "ui.class.remove", "transition");
            }
        }
    };
};
