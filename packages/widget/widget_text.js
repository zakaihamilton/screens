/*
 @author Zakai Hamilton
 @component WidgetText
 */

package.widget.text = function WidgetText(me) {
    me.depends = {
        properties:["text"]
    };
    me.class="widget.text.normal";
    me.tag_name = "div";
    me.set_text = function(object, value) {
        object.innerHTML = value;
    };
    me.get_text = function(object) {
        return object.innerHTML;
    };
};
