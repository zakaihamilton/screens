/*
 @author Zakai Hamilton
 @component UICheckBox
 */

package.ui.checkbox = new function UICheckBox() {
    var me = this;
    me.depends = {
        properties:["ui.element.state"]
    };
    me.type = "input";
    me.create = function(object) {
        object.type = "checkbox";
    };
    me.get_state = function(object) {
        return object.checked;
    };
    me.set_state = function(object, value) {
        object.checked = value;
    };
};
