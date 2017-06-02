/*
 @author Zakai Hamilton
 @component UIDropDown
 */

package.ui.dropdown = new function() {
    this.depends = ["ui.element.data"];
    this.create = function(properties) {
        var dropdown = document.createElement("select");
        var body = document.getElementsByTagName("body")[0];
        body.appendChild(dropdown);
        package.core.ref.path(dropdown);
        properties['ui.element.data'].map(function(option) { 
            var element = document.createElement("OPTION");
            element.setAttribute("value", option);
            var label = document.createTextNode(option);
            element.appendChild(label);
            dropdown.appendChild(element);
            var info = package.core.ref.path(element, "parentNode");
            console.log("found:" + package.core.ref.get(info.root, info.path, "childNodes"));
        });
    };
};
