/*
 @author Zakai Hamilton
 @component WidgetImage
 */

package.widget.image = function WidgetImage(me) {
    me.type = "img";
    me.depends = {
        properties:["ui.element.image"]
    };
    me.get_image = function(object) {
        return object.src;
    };
    me.set_image = function(object, value) {
        object.src = value;
    };
};
