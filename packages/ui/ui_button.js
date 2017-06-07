/*
 @author Zakai Hamilton
 @component UIButton
 */

package.ui.button = new function UIButton() {
    var me = this;
    me.depends = {
        properties:["ui.element.text","ui.event.pressed"]
    };
    me.type = "button";
    me.set_text = function(object, value) {
        object.innerHTML = value;
    };
    me.get_text = function(object) {
        return object.innerHTML;
    };
};
