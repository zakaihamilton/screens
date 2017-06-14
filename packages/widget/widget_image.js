/*
 @author Zakai Hamilton
 @component WidgetImage
 */

package.widget.image = function WidgetImage(me) {
    me.tag_name = "img";
    me.depends = {
        properties:["ui.element.image"]
    };
    me.image = {
        get : function(object) {
            return object.src;
        },
        set : function(object, value) {
            object.src = value;
        }
    };
};
