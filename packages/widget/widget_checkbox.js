/*
 @author Zakai Hamilton
 @component WidgetCheckBox
 */

package.widget.checkbox = function WidgetCheckBox(me) {
    me.depends = {
        properties: ["state"]
    };
    me.default = {
        "ui.basic.tag" : "div"
    };
    me.create = function (object) {
        me.ui.element.create([{
                "ui.basic.var": "input",
                "ui.basic.tag": "input",
                "ui.basic.type": "checkbox",
                "ui.style.position": "relative",
                "ui.style.opacity": 0,
                "ui.style.class": "widget.checkbox.original",
                "ui.basic.elementId": object.path
            },
            {
                "ui.basic.var": "checkbox",
                "ui.basic.tag": "label",
                "ui.basic.htmlFor": object.path,
                "ui.style.position": "relative",
                "ui.style.class": "widget.checkbox.icon",
                "ui.basic.elements": {
                    "ui.basic.var": "label",
                    "ui.basic.tag": "span",
                    "ui.style.position": "relative",
                    "ui.style.class": "widget.checkbox.label"
                }
            }], object);
        me.ui.element.set(object, "ui.basic.label", me.ui.element.to_object(object.checkbox).label);
    };
    me.state = {
        get : function(object) {
            return me.ui.element.to_object(object.input).checked;
        },
        set : function(object, value) {
            me.ui.element.to_object(object.input).checked = value;
        }
    };
};
