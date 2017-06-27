/*
 @author Zakai Hamilton
 @component WidgetCheckBox
 */

package.widget.checkbox = function WidgetCheckBox(me) {
    me.depends = {
        properties: ["state"]
    };
    me.default = {
        "ui.basic.tag": "div"
    };
    me.create = {
        set: function (object) {
            var ref = me.core.ref.gen();
            me.ui.element.create([{
                    "ui.basic.var": "input",
                    "ui.basic.tag": "input",
                    "ui.basic.type": "checkbox",
                    "ui.style.position": "relative",
                    "ui.style.opacity": 0,
                    "ui.theme.class": "widget.checkbox.original",
                    "ui.basic.elementId": ref
                },
                {
                    "ui.basic.var": "checkbox",
                    "ui.basic.tag": "label",
                    "ui.basic.htmlFor": ref,
                    "ui.style.position": "relative",
                    "ui.theme.class": "widget.checkbox.icon",
                    "ui.basic.elements": {
                        "ui.basic.var": "label",
                        "ui.basic.tag": "span",
                        "ui.style.position": "relative",
                        "ui.theme.class": "widget.checkbox.label"
                    }
                }], object);
            me.set(object, "ui.basic.label", object.var.label);
        }
    };
    me.state = {
        get: function (object) {
            return object.var.input.checked;
        },
        set: function (object, value) {
            object.var.input.checked = value;
        }
    };
};
