/*
 @author Zakai Hamilton
 @component UIRadio
 */

package.ui.radio = new function UIRadio() {
    var me = this;
    me.depends = {
        properties:["ui.element.state", "ui.element.group"]
    };
    me.type = "input";
    me.init = function(object) {
        object.type="radio";
    };
    me.get_group = function(object) {
        return object.name;
    };
    me.set_group = function(object, value) {
        object.name = value;
    };
    me.get_state = function(object) {
        return object.checked;
    };
    me.set_state = function(object, value) {
        object.checked = value;
    };
};
