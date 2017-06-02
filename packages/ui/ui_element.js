/*
 @author Zakai Hamilton
 @component UIElement
 */

package.ui.element = new function() {
    this.platform = "browser";
    this.matches = function(properties) {
        /* Find matching components */
        var matches = Object.keys(package["ui"]).map(function(component_name) {
            component = package["ui." + component_name];
            if(component.depends) {
                for(var depend_index = 0; depend_index < component.depends.length; depend_index++) {
                    if(!(component.depends[depend_index] in properties)) {
                        return null;
                    }
                }
                return component.id;
            }
            else {
                return null;
            }
        });
        return matches.filter(Boolean);
    };
    this.create = function(properties) {
        var matches = this.matches(properties);
        if(matches.length) {
            package[matches[0]].create(properties);
        }
    };
};
