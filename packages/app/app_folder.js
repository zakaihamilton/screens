/*
 @author Zakai Hamilton
 @component AppFolder
 */

package.app.folder = function AppFolder(me) {
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
        var folder = me.the.ui.element.create(json, "workspace", "self");
        me.the.core.property.notify(folder, "app.folder.refresh");
    };
    me.init = function () {
        me.path = me.the.core.object.property("app.folder.path");
        me.args = me.the.core.object.property("app.folder.args");
    };
    me.refresh = {
        set: function (object) {
            var window = me.the.widget.window.window(object);
            var path = me.the.core.property.get(window, "app.folder.path");
            me.the.core.file.readDir(function (err, items) {
                if (items) {
                    for (let item of items) {
                        var itemPath = path + "/" + item;
                        me.the.core.property.set(object, "app.folder.refreshElement", itemPath);
                    }
                }
            }, path);
        }
    };
    me.refreshElement = {
        set: function (object, path) {
            var name = me.the.core.path.fullName(path);
            me.the.core.file.isDirectory(function (isDirectory) {
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
                me.the.core.property.set(object, "elements", properties);
                me.the.core.property.notify(object, "update");
            }, path);
        }
    };
    me.shell = {
        set: function (object) {
            var args = me.the.core.cmd.split(me.the.core.property.get(object, "app.folder.args"));
            if (args) {
                console.log("folder launch args: " + JSON.stringify(args));
                me.launch(args);
            }
        }
    };
};
