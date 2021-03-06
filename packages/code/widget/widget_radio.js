/*
 @author Zakai Hamilton
 @component WidgetRadio
 */

screens.widget.radio = function WidgetRadio(me) {
    me.element = {
        dependencies: {
            properties: ["ui.basic.text", "state", "group"]
        },
        redirect: {
            "ui.basic.text": "text",
            "ui.monitor.change": "change"
        },
        properties: {
            "ui.class.class": "container",
            "ui.basic.elements": [{
                "ui.basic.var": "input",
                "ui.basic.tag": "input",
                "ui.basic.type": "radio",
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
                "ui.touch.click": "check"
            }
            ]
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
    me.check = {
        set: function (object) {
            object.parentNode.var.input.checked = true;
        }
    };
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
