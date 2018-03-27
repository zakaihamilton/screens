/*
 @author Zakai Hamilton
 @component WidgetCheckBox
 */

screens.widget.checkbox = function WidgetCheckBox(me) {
    me.dependencies = {
        properties: ["ui.basic.text","state"]
    };
    me.redirect = {
        "ui.basic.text": "text"
    };
    me.properties = {
        "ui.class.class": "container",
        "ui.basic.elements": [{
                "ui.basic.var": "input",
                "ui.basic.tag": "input",
                "ui.basic.type": "checkbox",
                "ui.class.class": "original",
                "ui.basic.elementId": "@ui.basic.ref"
            },
            {
                "ui.basic.tag": "label",
                "ui.basic.htmlFor": "@ui.basic.ref",
                "ui.class.class": "icon"
            },
            {
                "ui.basic.var": "label",
                "ui.class.class": "label",
                "ui.touch.click": "toggle"
            }
        ]
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
