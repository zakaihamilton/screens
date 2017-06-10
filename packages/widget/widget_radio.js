/*
 @author Zakai Hamilton
 @component WidgetRadio
 */

package.widget.radio = function WidgetRadio(me) {
    me.depends = {
        properties:["ui.element.state", "ui.element.group"]
    };
    me.type = "input";
    me.create = function(object) {
        object.type="radio";
    };
    me.get_group = function(object) {
        return object.name;
    };
    me.set_group = function(object, value) {
        object.name = value;
    };
    me.get_state = function(object) {
        return object.checked;
    };
    me.set_state = function(object, value) {
        object.checked = value;
    };
};
