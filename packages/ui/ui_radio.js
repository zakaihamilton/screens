/*
 @author Zakai Hamilton
 @component UIRadio
 */

package.ui.radio = new function() {
    this.depends = ["ui.element.checked", "ui.element.group"];
    this.type = "input";
    this.init = function(object) {
        object.type="radio";
    };
    this.get_group = function(object) {
        return object.name;
    };
    this.set_group = function(object, value) {
        object.name = value;
    };
    this.get_checked = function(object) {
        return object.checked;
    };
    this.set_checked = function(object, value) {
        object.checked = value;
    };
};
