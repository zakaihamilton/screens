/*
 @author Zakai Hamilton
 @component WidgetCheckBox
 */

package.widget.checkbox = function WidgetCheckBox(me) {
    me.depends = {
        properties: ["state"]
    };
    me.redirect = {
        "ui.basic.text": "text"
    };
    me.default = {
        "ui.class.class": "container"
    };
    me.create = {
        set: function (object) {
            var ref = me.core.ref.gen();
            me.ui.element.create([{
                    "ui.basic.var": "input",
                    "ui.basic.tag": "input",
                    "ui.basic.type": "checkbox",
                    "ui.class.class": "original",
                    "ui.basic.elementId": ref
                },
                {
                    "ui.basic.tag": "label",
                    "ui.basic.htmlFor": ref,
                    "ui.class.class": "icon"
                },
                {
                    "ui.basic.var": "label",
                    "ui.class.class": "label",
                    "ui.touch.click": "toggle"
                }
            ], object);
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
    me.toggle = {
        set: function (object, value) {
            object.parentNode.var.input.checked = !object.parentNode.var.input.checked;
        }
    }
    me.text = {
        get: function (object) {
            return object.var.label.innerHTML;
        },
        set: function (object, value) {
            object.var.label.innerHTML = value;
        }
    };
};
