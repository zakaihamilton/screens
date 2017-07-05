/*
 @author Zakai Hamilton
 @component WidgetRadio
 */

package.widget.radio = function WidgetRadio(me) {
    me.depends = {
        properties: ["state","group"]
    };
    me.redirect = {
        "ui.basic.text": "text"
    };
    me.default = {
        "ui.theme.class": "container"
    };
    me.create = {
        set: function (object) {
            var ref = me.core.ref.gen();
            me.ui.element.create([{
                    "ui.basic.var": "input",
                    "ui.basic.tag": "input",
                    "ui.basic.type": "radio",
                    "ui.theme.class": "original",
                    "ui.basic.elementId": ref
                },
                {
                    "ui.basic.tag": "label",
                    "ui.basic.htmlFor": ref,
                    "ui.theme.class": "icon"
                },
                {
                    "ui.basic.var": "label",
                    "ui.theme.class": "label",
                    "ui.touch.click": "activate"
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
    me.activate = {
        set: function (object, value) {
            object.parentNode.var.input.checked = true;
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
    me.group = {
        get: function (object) {
            return object.var.input.name;
        },
        set: function (object, value) {
            object.var.input.name = value;
        }
    };
};
