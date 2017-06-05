/*
 @author Zakai Hamilton
 @component UIInput
 */

package.ui.input = new function() {
    this.depends = ["ui.element.text","ui.element.edit"];
    this.type = "textarea";
    this.init = function(object) {
        object.type="text";
    };
    this.set_text = function(object, value) {
        object.innerHTML = value;
    };
    this.get_text = function(object) {
        return object.innerHTML;
    };
    this.get_rows = function(object) {
        return object.rows;
    };
    this.set_rows = function(object, value) {
        object.rows = value;
    };
    this.get_columns = function(object) {
        return object.cols;
    };
    this.set_columns = function(object, value) {
        object.cols = value;
    };
};
