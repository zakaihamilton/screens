/*
 @author Zakai Hamilton
 @component UIOption
 */

package.ui.option = new function UIOption() {
    var me = this;
    me.type = "option";
    me.depends = {
        parent:["ui.list"],
        properties:["ui.element.text"]
    };
    me.init = function(object) {
        var label = document.createTextNode(object.properties["ui.element.text"]);
        object.appendChild(label);
    };
    me.get_value = function(object) {
        return object.getAtrribute("value");
    };
    me.set_value = function(object, value) {
        object.setAttribute("value", value);
    }
};