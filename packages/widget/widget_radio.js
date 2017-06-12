/*
 @author Zakai Hamilton
 @component WidgetRadio
 */

package.widget.radio = function WidgetRadio(me) {
    me.depends = {
        properties:["state", "group"]
    };
    me.tag_name = "div";
    me.create = function(object) {
        object.input=me.ui.element.create({
            "tag_name":"input",
            "type":"radio",
            "ui.style.position":"relative",
            "ui.style.opacity":0,
            "ui.style.class":"widget.radio.original",
            "id":object.path
        }, object);
        object.radio=me.ui.element.create({
            "tag_name":"label",
            "htmlFor":object.path,
            "ui.style.position":"relative",
            "ui.style.class":"widget.radio.icon"
        }, object);
        object.label=me.ui.element.create({
            "tag_name":"span",
            "ui.style.position":"relative",
            "ui.style.class":"widget.radio.label"
        }, object.radio);
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
    me.get_group = function(object) {
        return me.ui.element.get(object.input, "name");
    };
    me.set_group = function(object, value) {
        me.ui.element.set(object.input, "name", value);
    };
};
