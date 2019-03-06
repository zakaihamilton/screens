/*
 @author Zakai Hamilton
 @component WidgetInput
 */

screens.widget.input = function WidgetInput(me, packages) {
    me.element = {
        dependencies: {
            properties: ["ui.basic.text", "ui.basic.type"]
        },
        redirect: {
            "ui.basic.text": "text"
        },
        properties: {
            "ui.basic.tag": "input",
            "ui.class.class": "normal",
            "ui.attribute.tabindex": "0"
        }
    };
    me.text = {
        get: function (object) {
            return object.value;
        },
        set: function (object, value) {
            if (typeof value !== "undefined") {
                object.value = value;
            }
        }
    };
    me.maxlength = {
        get: function (object) {
            return object.maxlength;
        },
        set: function (object, value) {
            object.maxlength = value;
        }
    };
    me.insertText = function (object, text) {
        if (typeof text !== "undefined") {
            object.value += text;
        }
    };
};
