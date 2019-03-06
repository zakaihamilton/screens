/*
 @author Zakai Hamilton
 @component WidgetEditor
 */

screens.widget.editor = function WidgetEditor(me, packages) {
    me.element = {
        properties: {
            "ui.basic.tag": "textarea",
            "ui.class.class": "border"
        },
        redirect: {
            "ui.basic.text": "text"
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
};
