/*
 @author Zakai Hamilton
 @component WidgetImage
 */

package.widget.image = function WidgetImage(me) {
    me.depends = {
        properties:["ui.basic.src"]
    };
    me.default = {
        "ui.basic.tag" : "img"
    };
};
