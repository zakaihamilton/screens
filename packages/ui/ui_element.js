/*
 @author Zakai Hamilton
 @component UIElement
 */

package.ui.element = new function() {
    this.platform = "browser";
    this.create = function(properties) {
        /* Rules */
        var type = null;
        if(properties['ui.element.data']) {
            type = "ui.dropdown";
        }
        else if(properties['ui.element.checked']) {
            type = "ui.checkbox";
        }
        else if(properties['ui.element.title'] && properties['ui.element.pressed']) {
            type = "ui.button";
        }
        if(type !== null) {
            package[type].create(properties);
        }
    };
};
