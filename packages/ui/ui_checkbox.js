/*
 @author Zakai Hamilton
 @component UICheckBox
 */

package.ui.checkbox = new function() {
    this.create = function(properties) {
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = properties['ui.element.checked'];
        var body = document.getElementsByTagName("body")[0];
        body.appendChild(checkbox);
        checkbox.addEventListener ("click", function() {
          package[properties['ui.element.pressed']](checkbox);
        });
    };
};
