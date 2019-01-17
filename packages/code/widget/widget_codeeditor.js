/*
 @author Zakai Hamilton
 @component WidgetCodeEditor
 */

screens.widget.codeeditor = function WidgetCodeEditor(me) {
    me.init = async function () {
        await me.core.require.load([
            "/node_modules/ace-builds/src/ace.js",
        ]);
        await me.core.require.load([
            "/node_modules/ace-builds/src/ext-modelist.js",
            "/node_modules/ace-builds/src/ext-beautify.js"
        ]);
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
            object.editor = ace.edit(object);
            object.themeMethod = function (element, nightMode) {
                element.editor.setTheme(nightMode ? "ace/theme/monokai" : "ace/theme/tomorrow");
            };
        }
    };
    me.path = {
        get: function (object) {
            return object.file_path;
        },
        set: function (object, value) {
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
        beautify.beautify(object.editor.session);
    };
};
