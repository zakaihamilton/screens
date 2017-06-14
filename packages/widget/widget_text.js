/*
 @author Zakai Hamilton
 @component WidgetText
 */

package.widget.text = function WidgetText(me) {
    me.depends = {
        properties:["ui.basic.text"]
    };
    me.class="widget.text.normal";
    me.default = {
        "ui.basic.tag" : "div"
    };
};
