/*
 @author Zakai Hamilton
 @component UICheckBox
 */

package.ui.checkbox = new function UICheckBox() {
    var me = this;
    me.depends = {
        properties:["ui.element.checked"]
    };
    me.type = "input";
    me.init = function(object) {
        object.type = "checkbox";
    };
    me.get_checked = function(object) {
        return object.checked;
    };
    me.set_checked = function(object, value) {
        object.checked = value;
    };
};
