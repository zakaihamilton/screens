/*
 @author Zakai Hamilton
 @component UICheckBox
 */

package.ui.checkbox = new function() {
    this.depends = ["ui.element.checked"];
    this.type = "checkbox";
    this.set_checked = function(object, value) {
        object.checked = value;
    };
};
