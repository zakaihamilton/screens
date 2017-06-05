/*
 @author Zakai Hamilton
 @component UIButton
 */

package.ui.button = new function() {
    this.depends = ["ui.element.text"];
    this.type = "button";
    this.set_text = function(object, value) {
        object.innerHTML = value;
    };
    this.get_text = function(object) {
        return object.innerHTML;
    };
};
