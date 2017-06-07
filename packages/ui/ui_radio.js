/*
 @author Zakai Hamilton
 @component UIRadio
 */

package.ui.radio = new function UIRadio() {
    var me = this;
    me.depends = {
        properties:["ui.element.checked", "ui.element.group"]
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
    me.get_checked = function(object) {
        return object.checked;
    };
    me.set_checked = function(object, value) {
        object.checked = value;
    };
};
