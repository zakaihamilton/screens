/*
 @author Zakai Hamilton
 @component UINode
 */

package.ui.header = function UINode(me) {
    me.depends = {
        parent:["ui.screen"],
        properties:["ui.element.text"]
    };
    me.type="header";
    me.set_text = function(object, value) {
        object.innerHTML = value;
    };
    me.get_text = function(object) {
        return object.innerHTML;
    };
};
