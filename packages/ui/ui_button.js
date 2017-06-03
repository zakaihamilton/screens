/*
 @author Zakai Hamilton
 @component UIButton
 */

package.ui.button = new function() {
    this.depends = ["ui.element.title"];
    this.type = "button";
    this.set_title = function(object, value) {
        object.innerHTML = value;
    };
};
