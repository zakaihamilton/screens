/*
 @author Zakai Hamilton
 @component UICheckBox
 */

package.ui.checkbox = new function UICheckBox() {
    var me = this;
    me.depends = {
        properties:["ui.element.state"]
    };
    me.type = "div";
    me.class="ui.checkbox.standard";
    me.create = function(object) {
        
    };
    me.get_state = function(object) {
        return object.checked;
    };
    me.set_state = function(object, value) {
        object.checked = value;
    };
    me.set_text = function(object, value) {
        object.innerHTML = value;
    };
    me.get_text = function(object) {
        return object.innerHTML;
    };
};
