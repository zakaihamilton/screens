/*
 @author Zakai Hamilton
 @component UIDropDown
 */

package.ui.list = new function() {
    this.depends = ["ui.element.data"];
    this.type = "select";
    this.set_data = function(object, value) {
        value.map(function(option) { 
            var element = document.createElement("OPTION");
            element.setAttribute("value", option);
            var label = document.createTextNode(option);
            element.appendChild(label);
            object.appendChild(element);
        });
    };
    this.get_selection = function(object) {
        return object.options[object.selectedIndex].value;
    };
    this.get_count = function(object) {
        return object.size;
    };
    this.set_count = function(object, value) {
        object.size = value;
    };
    this.get_multiple = function(object) {
        return object.multiple;
    };
    this.set_multiple = function(object, value) {
        object.multiple = value;
    };
};
