/*
 @author Zakai Hamilton
 @component UICheckBox
 */

package.ui.checkbox = new function() {
    this.depends = ["ui.element.checked"];
    this.type = "input";
    this.init = function(object) {
        object.type = "checkbox";
    };
    this.get_checked = function(object) {
        return object.checked;
    };
    this.set_checked = function(object, value) {
        object.checked = value;
    };
};
