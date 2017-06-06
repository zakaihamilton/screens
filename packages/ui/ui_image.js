/*
 @author Zakai Hamilton
 @component UIImage
 */

package.ui.image = new function() {
    this.type = "img";
    this.depends = ["ui.element.image"];
    this.get_image = function(object) {
        return object.src;
    };
    this.set_image = function(object, value) {
        object.src = value;
    };
};
