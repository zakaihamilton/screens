/*
 @author Zakai Hamilton
 @component WidgetRichEditor
 */

screens.widget.richeditor = function WidgetRichEditor(me, { core }) {
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
                object.editor = new Quill(object, {
                    modules: {
                        toolbar: {
                            container: [
                                [{ "font": ["Sans Serif", "serif", "monospace"] }],
                                [{ "size": ["small", false, "large", "huge"] }],
                                ["bold", "italic", "underline", "strike"],
                                [{ "script": "sub" }, { "script": "super" }],
                                [{ "header": 1 }, { "header": 2 }, "blockquote", "code-block"],
                                [{ "list": "ordered" }, { "list": "bullet" }],
                                [{ "indent": "-1" }, { "indent": "+1" }],
                                [{ "direction": "rtl" }, { "align": ["", "center", "right", "justify"] }],
                                ["link", "image", "video", "formula"],
                                ["speech"],
                                ["clean"]
                            ],
                            handlers: {
                                "speech": () => me.toggleSpeech(object)
                            }
                        }
                    },
                    theme: "snow"
                });
                let showTooltip = (el) => {
                    let name = el.className.replace("ql-", "");
                    var tooltip = core.string.title(name);
                    if (el.value) {
                        tooltip = core.string.title(el.value) + " " + tooltip;
                    }
                    var replacements = {
                        "1 Header": "Heading 1",
                        "2 Header": "Heading 2",
                        "-1 Indent": "Decrease Indentation",
                        "+1 Indent": "Increase Indentation",
                        "Rtl Direction": "Text Direction"
                    };
                    if (replacements[tooltip]) {
                        tooltip = replacements[tooltip];
                    }
                    el.setAttribute("title", tooltip);
                };

                var window = me.widget.window.get(object);
                var toolbar = me.ui.node.classMember(window, "ql-toolbar");
                if (toolbar) {
                    let matches = toolbar.querySelectorAll("button");
                    for (let el of matches) {
                        showTooltip(el);
                    }
                }
                me.ui.theme.updateElements(toolbar);
            }
        }
    };
    me.toggleSpeech = function (object) {
        var window = me.widget.window.get(object);
        var result = me.ui.speech.toggle(object);
        var toolbar = me.ui.node.classMember(window, "ql-toolbar");
        var button = me.ui.node.classMember(toolbar, "ql-speech");
        core.property.set(button, "ui.class.speechActive", result);
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
    me.insertText = function (object, text) {
        var range = object.editor.getSelection();
        var offset = object.editor.getLength() - 1;
        if (range && !range.length) {
            offset = range.index;
        }
        object.editor.insertText(offset, text);
    };
    me.insertLink = function (object, info) {
        var range = object.editor.getSelection();
        var offset = object.editor.getLength() - 1;
        if (range && !range.length) {
            offset = range.index;
        }
        object.editor.insertText(offset, info.label, "link", info.url);
        object.editor.insertText(offset, "\n");
    };
    return "browser";
};
