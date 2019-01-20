/*
 @author Zakai Hamilton
 @component AppPropagate
 */

screens.app.propagate = function AppPropagate(me) {
    me.scriptsDir = "packages/res/scripts";
    me.init = async function () {
        me.scriptList = await me.core.file.readDir(me.scriptsDir);
    };
    me.launch = function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element.create(__json__, "workspace", "self");
    };
    me.initOptions = async function (object) {
        var window = me.widget.window.get(object);
        me.ui.options.load(me, window, {
            type: "Auto"
        });
        me.ui.options.toggleSet(me, null, {

        });
        me.ui.options.choiceSet(me, null, {
            type: me.setFileType
        });
        me.core.property.set(window, "app", me);
        me.core.property.set(window, "name", "");
    };
    me.clear = function (object) {
        var window = me.widget.window.get(object);
        window.files = [];
        me.file.set(object, null);
    };
    me.selectFiles = function (object) {
        var window = me.widget.window.get(object);
        window.files = Array.from(object.files);
        me.core.property.set(me.ui.node.container(object, "widget.menu.popup"), "back");
        if (window.files && window.files.length) {
            me.fileName.set(object, window.files[0].name);
        }
    };
    me.files = function (object) {
        var window = me.widget.window.get(object);
        var info = {
            list: window.files,
            options: { "state": "select" },
            property: "name",
            group: "files",
            keepCase: true,
            emptyMsg: "No Files Selected",
            itemMethod: "app.propagate.fileName"
        };
        return me.widget.menu.collect(object, info);
    };
    me.fileName = {
        get: function (object, name) {
            var window = me.widget.window.get(object);
            var fileName = me.core.property.get(window, "name");
            return fileName.toLowerCase() === name.toLowerCase();
        },
        set: async function (object, name) {
            var window = me.widget.window.get(object);
            var content = await me.content(object, name);
            me.core.property.set(window, "name", name);
            me.setFileType(object);
            me.core.property.set(window.var.editor, "text", content);
        }
    };
    me.setFileType = function (object) {
        var window = me.widget.window.get(object);
        var name = me.core.property.get(window, "name", name);
        if (window.options.type === "Auto") {
            me.core.property.set(window.var.editor, "path", name);
        }
        else {
            me.core.property.set(window.var.editor, "path", "");
        }
    };
    me.content = async function (object, name) {
        var window = me.widget.window.get(object);
        var content = "";
        if (name) {
            var file = window.files.find(file => file.name.toLowerCase() === name.toLowerCase());
            if (typeof file.content !== "undefined") {
                content = file.content;
            }
            else {
                content = await me.storage.upload.readFile(file, true);
            }
        }
        return content;
    };
    me.download = async function (object) {
        var window = me.widget.window.get(object);
        var text = me.core.property.get(window.var.editor, "text");
        var name = me.core.property.get(window, "name");
        me.file.text.export(name, text);
    };
    me.importData = function (object, text, title) {
        var window = me.widget.window.get(object);
        me.core.property.set(window, "name", title);
        me.core.property.set(window.var.editor, "text", text);
    };
    me.exportText = function (object, target) {
        var window = me.widget.window.get(object);
        var text = me.core.property.get(window.var.editor, "text");
        me.core.property.set(target, "importData", text);
    };
    me.format = function (object) {
        var window = me.widget.window.get(object);
        me.core.property.set(window.var.editor, "format");
    };
    me.scripts = function (object) {
        var list = me.scriptList.filter(file => file.endsWith(".js")).map(file => me.core.path.fileName(file));
        var info = {
            list,
            group: "scripts",
            keepCase: true,
            emptyMsg: "No Scripts Available",
            itemMethod: "app.propagate.runScript"
        };
        return me.widget.menu.collect(object, info);
    };
    me.output = function (object, name, text, activate) {
        var window = me.widget.window.get(object);
        var file = window.files.find(file => file.name.toLowerCase() === name.toLowerCase());
        if (file) {
            file.content = text;
        }
        else {
            window.files.push({
                name,
                content: text
            });
        }
        if (activate) {
            me.fileName.set(object, name);
        }
    };
    me.runScript = async function (object, name) {
        var code = await me.core.file.readFile(me.scriptsDir + "/" + name + ".js", "utf8");
        try {
            var func = new Function("me", "object", code);
            if (func) {
                func(me, object);
            }
        }
        catch (err) {
            alert("Error: " + err.message + " stack: " + err.stack);
        }
    };
};
