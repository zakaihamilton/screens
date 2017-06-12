/*
 @author Zakai Hamilton
 @component WidgetOption
 */

package.widget.option = function WidgetOption(me) {
    me.tag_name = "option";
    me.depends = {
        parent:["ui.list"],
        properties:["text"]
    };
    me.create = function(object) {
        var label = document.createTextNode(object.properties["text"]);
        object.appendChild(label);
    };
    me.get_value = function(object) {
        return object.getAtrribute("value");
    };
    me.set_value = function(object, value) {
        object.setAttribute("value", value);
    }
};