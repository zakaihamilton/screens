/*
 @author Zakai Hamilton
 @component WidgetImage
 */

package.widget.image = function WidgetImage(me) {
    me.default = {
        "ui.basic.tag" : "img"
    };
    me.depends = {
        properties:["ui.basic.src"]
    };
};
