/*
 @author Zakai Hamilton
 @component WidgetRichEditor
 */

screens.widget.richeditor = function WidgetRichEditor(me) {
    me.init = async function () {
        me.import("/node_modules/quill/dist/quill.snow.css");
        me.quill = await me.core.require.load("/node_modules/quill/dist/quill.js");
    };
    me.element = {
        properties: {
            "ui.basic.tag": "div",
            "ui.class.classExtra": "container"
        },
        redirect: {
            "ui.basic.text": "text"
        },
        create: function (object) {
            if (!object.editor) {
                object.editor = new me.quill(object, {
                    modules: {
                        toolbar: [
                            [{ "font": ["Sans Serif", "serif", "monospace"] }],
                            [{ "size": ["small", false, "large", "huge"] }],
                            ["bold", "italic", "underline", "strike"],
                            ["color", "background"],
                            [{ "script": "sub" }, { "script": "super" }],
                            [{ "header": 1 }, { "header": 2 }, "blockquote", "code-block"],
                            [{ "list": "ordered" }, { "list": "bullet" }, { "indent": "-1" }, { "indent": "+1" }],
                            [{ "direction": "rtl" }, { "align": ["", "center", "right", "justify"] }],
                            ["link", "image", "video", "formula"],
                            ["clean"]
                        ]
                    },
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
};
