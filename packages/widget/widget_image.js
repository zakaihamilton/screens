/*
 @author Zakai Hamilton
 @component WidgetImage
 */

package.widget.image = function WidgetImage(me) {
    me.default = {
        "ui.basic.tag" : "img"
    };
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
