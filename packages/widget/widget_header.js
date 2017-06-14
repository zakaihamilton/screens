/*
 @author Zakai Hamilton
 @component WidgetHeader
 */

package.widget.header = function WidgetHeader(me) {
    me.depends = {
        parent:["widget.screen"],
        properties:["text"]
    };
    me.tag_name="header";
    me.text = {
        get : function(object) {
            return object.innerHTML;
        },
        set : function(object, value) {
            object.innerHTML = value;
        }
    };
};
