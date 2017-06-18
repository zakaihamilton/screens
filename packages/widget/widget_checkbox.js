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
                "ui.theme.class": "widget.checkbox.original",
                "ui.basic.elementId": me.ui.element.to_path(object)
            },
            {
                "ui.basic.var": "checkbox",
                "ui.basic.tag": "label",
                "ui.basic.htmlFor": me.ui.element.to_path(object),
                "ui.style.position": "relative",
                "ui.theme.class": "widget.checkbox.icon",
                "ui.basic.elements": {
                    "ui.basic.var": "label",
                    "ui.basic.tag": "span",
                    "ui.style.position": "relative",
                    "ui.theme.class": "widget.checkbox.label"
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
