/*
 @author Zakai Hamilton
 @component AppPropagate
 */

screens.app.propagate = function AppPropagate(me, { core, ui, widget, storage }) {
    me.scriptsDir = "packages/res/scripts";
    me.launch = async function () {
        if (core.property.get(me.singleton, "ui.node.parent")) {
            core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.scriptList = await core.file.readDir(me.scriptsDir);
        me.singleton = ui.element.create(me.json, "workspace", "self");
    };
    me.initOptions = async function (object) {
        var window = widget.window.get(object);
        ui.options.load(me, window, {
            type: "Auto",
            format: true
        });
        ui.options.toggleSet(me, null, {
            format: (object) => {
                me.setFormat(object);
            }
        });
        ui.options.choiceSet(me, null, {
            type: (object) => {
                me.setFileType(object);
                me.setFormat(object);
            }
        });
        core.property.set(window, "app", me);
        core.property.set(window, "name", "");
        window.files = [];
    };
    me.clear = function (object) {
        var window = widget.window.get(object);
        window.files = [];
        me.fileName.set(object, null);
    };
    me.selectFiles = function (object, event) {
        var window = widget.window.get(object);
        window.files = Array.from(event.files);
        if (window.files && window.files.length) {
            me.fileName.set(object, window.files[0].name);
        }
    };
    me.files = function (object) {
        var window = widget.window.get(object);
        var info = {
            list: window.files,
            options: { "state": "select" },
            property: "name",
            group: "files",
            separator: true,
            keepCase: true,
            emptyMsg: "No Files Selected",
            itemMethod: "app.propagate.fileName"
        };
        return widget.menu.collect(object, info);
    };
    me.fileName = {
        get: function (object, name) {
            var window = widget.window.get(object);
            var fileName = core.property.get(window, "name");
            return fileName.toLowerCase() === name.toLowerCase();
        },
        set: async function (object, name) {
            var window = widget.window.get(object);
            var content = await me.content(object, name);
            core.property.set(window, "name", name);
            me.setFileType(object);
            core.property.set(window.var.editor, "text", content);
            me.setFormat(object);
        }
    };
    me.setFileType = function (object) {
        var window = widget.window.get(object);
        var name = core.property.get(window, "name", name);
        if (window.options.type === "Auto") {
            core.property.set(window.var.editor, "path", name);
        }
        else {
            core.property.set(window.var.editor, "path", "");
        }
    };
    me.setFormat = function (object) {
        var window = widget.window.get(object);
        if (window.options.format) {
            core.property.set(window.var.editor, "format");
        }
    };
    me.content = async function (object, name) {
        var window = widget.window.get(object);
        var content = "";
        if (name) {
            var file = window.files.find(file => file.name.toLowerCase() === name.toLowerCase());
            if (file) {
                if (typeof file.content !== "undefined") {
                    content = file.content;
                }
                else {
                    content = await storage.upload.readFile(file, true);
                }
            }
        }
        return content;
    };
    me.download = async function (object) {
        var window = widget.window.get(object);
        var text = core.property.get(window.var.editor, "text");
        var name = core.property.get(window, "name");
        me.file.text.export(name, text);
    };
    me.importData = function (object, text, title) {
        var window = widget.window.get(object);
        core.property.set(window, "name", title);
        core.property.set(window.var.editor, "text", text);
    };
    me.exportText = function (object, target) {
        var window = widget.window.get(object);
        var text = core.property.get(window.var.editor, "text");
        core.property.set(target, "importData", text);
    };
    me.scripts = function (object) {
        var list = me.scriptList.filter(file => file.endsWith(".js")).map(file => core.path.fileName(file));
        var info = {
            list,
            group: "scripts",
            separator: true,
            title: true,
            emptyMsg: "No Scripts Available",
            itemMethod: "app.propagate.runScript"
        };
        return widget.menu.collect(object, info);
    };
    me.refresh = async function () {
        me.scriptList = await core.file.readDir(me.scriptsDir);
    };
    me.output = function (object, name, text, activate) {
        var window = widget.window.get(object);
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
        setTimeout(() => {
            me.setFormat(window);
        });
    };
    me.runScript = async function (object, name) {
        var code = await core.file.readFile(me.scriptsDir + "/" + name + ".js", "utf8");
        try {
            var func = new Function("me", "object", "packages", code);
            if (func) {
                func(me, object, packages);
            }
        }
        catch (err) {
            alert("Error: " + err.message + " stack: " + err.stack);
        }
    };
};
