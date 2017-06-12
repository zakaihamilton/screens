/*
 @author Zakai Hamilton
 @component WidgetCheckBox
 */

package.widget.checkbox = function WidgetCheckBox(me) {
    me.depends = {
        properties:["state"]
    };
    me.tag_name = "div";
    me.create = function(object) {
        object.input=me.ui.element.create({
            "tag_name":"input",
            "type":"checkbox",
            "ui.style.position":"relative",
            "ui.style.opacity":0,
            "ui.style.class":"widget.checkbox.original",
            "id":object.path
        }, object);
        object.checkbox=me.ui.element.create({
            "tag_name":"label",
            "htmlFor":object.path,
            "ui.style.position":"relative",
            "ui.style.class":"widget.checkbox.icon"
        }, object);
        object.label=me.ui.element.create({
            "tag_name":"span",
            "ui.style.position":"relative",
            "ui.style.class":"widget.checkbox.label"
        }, object.checkbox);
    };
    me.get_state = function(object) {
        return me.ui.element.get(object.input, "checked");
    };
    me.set_state = function(object, value) {
        me.ui.element.set(object.input, "checked", value);
    };
    me.set_text = function(object, value) {
        me.ui.element.set(object.label, "innerHTML", value);
    };
    me.get_text = function(object) {
        me.ui.element.get(object.label, "innerHTML");
    };
};
