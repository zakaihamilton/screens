/*
 @author Zakai Hamilton
 @component WidgetRichEditor
 */

screens.widget.richeditor = function WidgetRichEditor(me) {
    me.init = async function () {
        me.import("node_modules/quill/dist/quill.snow.css");
        me.quill = await me.core.require.load("/node_modules/quill/dist/quill.js");
    };
    me.element = {
        properties: {
            "ui.basic.tag": "div",
            "ui.class.class": "container"
        },
        redirect: {
            "ui.basic.text": "text"
        },
        create: async function (object) {
            if (!object.editor) {
                object.editor = new me.quill(object, {
                    theme: "snow"
                });
            }
        }
    };
    me.contents = {
        get: function (object) {
            return object.editor.getContents();
        },
        set: function (object, value) {
            if (typeof value !== "undefined") {
                if (typeof value === "string") {
                    value = JSON.parse(value);
                }
                object.editor.setContents(value);
            }
        }
    };
    me.text = {
        get: function (object) {
            return object.editor.getText();
        },
        set: function (object, value) {
            if (typeof value !== "undefined") {
                object.editor.setText(value);
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
