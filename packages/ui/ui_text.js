/*
 @author Zakai Hamilton
 @component UIText
 */

package.ui.text = new function UIText() {
    var me = this;
    me.depends = {
        properties:["ui.element.text"]
    };
    me.type = "div";
    me.set_text = function(object, value) {
        object.innerHTML = value;
    };
    me.get_text = function(object) {
        return object.innerHTML;
    };
};
