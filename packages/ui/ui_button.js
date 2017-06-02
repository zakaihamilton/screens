/*
 @author Zakai Hamilton
 @component UIButton
 */

package.ui.button = new function() {
    this.depends = ["ui.element.title","ui.element.pressed"];
    this.create = function(properties) {
        var button = document.createElement("button");
        button.innerHTML = properties['ui.element.title'];
        var body = document.getElementsByTagName("body")[0];
        body.appendChild(button);
        package.core.ref.path(button, "parentNode");
        button.addEventListener ("click", function() {
          package[properties['ui.element.pressed']](button);
        });
    };
};
