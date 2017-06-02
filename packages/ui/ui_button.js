/*
 @author Zakai Hamilton
 @component UIButton
 */

package.ui.button = new function() {
    this.create = function(properties) {
        var button = document.createElement("button");
        button.innerHTML = properties['ui.element.title'];
        var body = document.getElementsByTagName("body")[0];
        body.appendChild(button);
        button.addEventListener ("click", function() {
          package[properties['ui.element.pressed']](button);
        });
    };
};
