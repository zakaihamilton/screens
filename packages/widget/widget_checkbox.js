/*
 @author Zakai Hamilton
 @component WidgetCheckBox
 */

package.widget.checkbox = function WidgetCheckBox(me) {
    me.depends = {
        properties: ["state"]
    };
    me.redirect = {
        "ui.basic.text" : "text"
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
                    "ui.theme.class": "original",
                    "ui.basic.elementId": ref
                },
                {
                    "ui.basic.var": "checkbox",
                    "ui.basic.tag": "label",
                    "ui.basic.htmlFor": ref,
                    "ui.theme.class": "icon",
                    "ui.basic.elements": {
                        "ui.basic.var": "label",
                        "ui.basic.tag": "span",
                        "ui.theme.class": "label"
                    }
                }], object);
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
    me.text = {
        get: function (object) {
            return object.var.label.innerHTML;
        },
        set: function(object, value) {
            object.var.label.innerHTML = value;
        }
    };
};
