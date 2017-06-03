/*
 @author Zakai Hamilton
 @component UIDropDown
 */

package.ui.dropdown = new function() {
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
};
