/*
 @author Zakai Hamilton
 @component WidgetCodeEditor
 */

screens.widget.codeeditor = function WidgetCodeEditor(me) {
    me.element = {
        properties: {
            "ui.basic.tag": "div",
            "ui.style.fontFamily": "monospace"
        },
        redirect: {
            "ui.basic.text": "text"
        },
        create: function (object) {
            ace.config.set("basePath", "/node_modules/ace-builds/src-min");
            object.editor = ace.edit(object, {
                showPrintMargin: false
            });
            object.themeMethod = me.updateTheme;
            me.updateTheme(object);
        },
        draw: function (object) {
            object.editor.resize();
        }
    };
    me.resize = function (object) {
        object.editor.resize();
    };
    me.updateTheme = function (object) {
        var nightMode = me.ui.theme.options.nightMode;
        object.editor.setTheme(nightMode ? "ace/theme/monokai" : "ace/theme/tomorrow");
    };
    me.path = {
        get: function (object) {
            return object.file_path;
        },
        set: function (object, value) {
            if (!value) {
                value = "";
            }
            object.file_path = value;
            var modelist = ace.require("ace/ext/modelist");
            var mode = modelist.getModeForPath(object.file_path).mode;
            object.editor.session.setMode(mode);
        }
    };
    me.text = {
        get: function (object) {
            return object.editor.getValue();
        },
        set: function (object, value) {
            if (typeof value !== "undefined") {
                object.editor.session.setValue(value);
            }
        }
    };
    me.insertText = function (object, text) {
        object.editor.insert(text);
    };
    me.format = function (object) {
        var beautify = ace.require("ace/ext/beautify");
        var modelist = ace.require("ace/ext/modelist");
        var filePath = object.file_path;
        if (!filePath) {
            filePath = "";
        }
        var mode = modelist.getModeForPath(filePath).mode;
        if (mode === "ace/mode/json") {
            object.editor.session.setValue(JSON.stringify(JSON.parse(object.editor.getValue()), null, 4));
        }
        else {
            beautify.beautify(object.editor.session);
        }
    };
    me.readOnly = {
        get: function (object) {
            return object.editor.getReadOnly();
        },
        set: function (object, value) {
            if (typeof value !== "undefined") {
                object.editor.setReadOnly(value);
            }
        }
    };
    return "browser";
};
