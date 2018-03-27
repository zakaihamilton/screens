/*
 @author Zakai Hamilton
 @component AppFolder
 */

screens.app.folder = function AppFolder(me) {
    me.launch = function (args) {
        var path = args[0];
        var json = __json__;
        var name = path;
        if(!name || name === ".") {
            name = "/";
        }
        else {
            name = name.replace("./", "/");
        }
        json.title = "Folder - " + name;
        json["app.folder.path"] = path;
        var folder = me.ui.element(json, "workspace", "self");
        me.core.property.notify(folder, "app.folder.refresh");
        return folder;
    };
    me.init = function () {
        me.core.property.set(me, {
            "core.object.path":null,
            "core.object.args":null
        });
    };
    me.refresh = {
        set: function (object) {
            var window = me.widget.window(object);
            var path = me.core.property.get(window, "app.folder.path");
            me.core.file.readDir(function (err, items) {
                if (items) {
                    for (let item of items) {
                        var itemPath = path + "/" + item;
                        me.core.property.set(object, "app.folder.refreshElement", itemPath);
                    }
                }
            }, path);
        }
    };
    me.refreshElement = {
        set: function (object, path) {
            var name = me.core.path.fullName(path);
            me.core.file.isDirectory(function (isDirectory) {
                var properties = null;
                if (isDirectory) {
                    properties = {
                        "text": name,
                        "ui.basic.src": "/packages/res/icons/folder.svg",
                        "app.folder.args": path,
                        "ui.touch.dblclick": "app.folder.shell"
                    };
                } else {
                    properties = {
                        "text": name,
                        "ui.basic.src": "/packages/res/icons/file.png",
                        "app.progman.args": "viewer " + path,
                        "ui.touch.dblclick": "app.progman.shell"
                    };
                }
                me.core.property.set(object, "elements", properties);
                me.core.property.notify(object, "update");
            }, path);
        }
    };
    me.shell = {
        set: function (object) {
            var args = me.core.cmd.split(me.core.property.get(object, "app.folder.args"));
            if (args) {
                me.log("folder launch args: " + JSON.stringify(args));
                me.launch(args);
            }
        }
    };
};
