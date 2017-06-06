/*
 @author Zakai Hamilton
 @component UIText
 */

package.ui.text = new function() {
    this.depends = ["ui.element.text"];
    this.type = "div";
    this.init = function(object) {
        
    };
    this.set_text = function(object, value) {
        object.innerHTML = value;
    };
    this.get_text = function(object) {
        return object.innerHTML;
    };
};
