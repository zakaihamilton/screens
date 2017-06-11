/*
 @author Zakai Hamilton
 @component WidgetCheckBox
 */

package.widget.checkbox = function WidgetCheckBox(me) {
    me.depends = {
        properties:["ui.element.state"]
    };
    me.type = "div";
    me.create = function(object) {
        object.input=document.createElement("input");
        object.input.type="checkbox";
        object.input.style.opacity=0;
        object.input.style.position = "relative";
        object.input.id = object.path;
        object.appendChild(object.input);
        object.checkbox=document.createElement("label");
        object.checkbox.htmlFor=object.path;
        object.appendChild(object.checkbox);
        object.label=document.createElement("span");
        object.label.style.position = "relative";
        object.checkbox.appendChild(object.label);
        me.ui.style.add_class(object.input, "widget.checkbox.original");
        me.ui.style.add_class(object.checkbox, "widget.checkbox.icon");
        me.ui.style.add_class(object.label, "widget.checkbox.label");
    };
    me.get_state = function(object) {
        return object.input.checked;
    };
    me.set_state = function(object, value) {
        object.input.checked = value;
    };
    me.set_text = function(object, value) {
        object.label.innerHTML = value;
    };
    me.get_text = function(object) {
        return object.label.innerHTML;
    };
};
