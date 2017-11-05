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
        var folder = me.package.ui.element.create(json, "workspace", "self");
        me.package.core.property.notify(folder, "app.folder.refresh");
    };
    me.init = function () {
        me.path = me.package.core.object.property("app.folder.path");
        me.args = me.package.core.object.property("app.folder.args");
    };
    me.refresh = {
        set: function (object) {
            var window = me.package.widget.window.window(object);
            var path = me.package.core.property.get(window, "app.folder.path");
            me.package.core.file.readDir(function (err, items) {
                if (items) {
                    for (let item of items) {
                        var itemPath = path + "/" + item;
                        me.package.core.property.set(object, "app.folder.refreshElement", itemPath);
                    }
                }
            }, path);
        }
    };
    me.refreshElement = {
        set: function (object, path) {
            var name = me.package.core.path.fullName(path);
            me.package.core.file.isDirectory(function (isDirectory) {
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
                me.package.core.property.set(object, "elements", properties);
                me.package.core.property.notify(object, "update");
            }, path);
        }
    };
    me.shell = {
        set: function (object) {
            var args = me.package.core.cmd.split(me.package.core.property.get(object, "app.folder.args"));
            if (args) {
                console.log("folder launch args: " + JSON.stringify(args));
                me.launch(args);
            }
        }
    };
};
