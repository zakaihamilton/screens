/*
 @author Zakai Hamilton
 @component UICheckBox
 */

package.ui.checkbox = new function() {
    this.depends = ["ui.element.checked"];
    this.create = function(properties) {
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = properties['ui.element.checked'];
        var body = document.getElementsByTagName("body")[0];
        body.appendChild(checkbox);
        package.core.ref.path(checkbox, "parentNode");
        checkbox.addEventListener ("click", function() {
          if(properties['ui.element.pressed']) {
              package[properties['ui.element.pressed']](checkbox);
          }
        });
    };
};
