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
    me.text = {
        get : function(object) {
            return object.innerHTML;
        },
        set : function(object, value) {
            object.innerHTML = value;
        }
    };
};
