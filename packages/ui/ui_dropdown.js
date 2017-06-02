/*
 @author Zakai Hamilton
 @component UIDropDown
 */

package.ui.dropdown = new function() {
    this.create = function(properties) {
        var dropdown = document.createElement("select");
        var body = document.getElementsByTagName("body")[0];
        body.appendChild(dropdown);
        properties['ui.element.data'].map(function(option) { 
            var element = document.createElement("OPTION");
            element.setAttribute("value", option);
            var label = document.createTextNode(option);
            element.appendChild(label);
            dropdown.appendChild(element);        
        });
    };
};
