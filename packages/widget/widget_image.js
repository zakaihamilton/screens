/*
 @author Zakai Hamilton
 @component WidgetImage
 */

package.widget.image = function WidgetImage(me) {
    me["ui.element.depends"] = {
        properties:["ui.basic.src"]
    };
    me["ui.element.default"] = {
        "ui.basic.tag" : "img"
    };
};
