/*
 @author Zakai Hamilton
 @component AppFolder
 */

package.app.folder = function AppFolder(me) {
    me.launch = function (args) {
        var path = args[0];
        var json = __json__;
        json.title = me.core.path.name(path);
        json["app.folder.path"] = path;
        var folder = me.ui.element.create(json);
        me.notify(folder, "app.folder.refresh");
    };
    me.init = function () {
        me.path = me.core.object.property("app.folder.path");
        me.args = me.core.object.property("app.folder.args");
    };
    me.refresh = {
        set: function (object) {
            var window = me.widget.window.window(object);
            var path = me.get(window, "app.folder.path");
            me.core.file.readDir(function (err, items) {
                if (items) {
                    for (let item of items) {
                        var itemPath = path + "/" + item;
                        me.set(object, "app.folder.refreshElement", itemPath);
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
                        "app.progman.args": "folder " + path,
                        "ui.touch.dblclick": "app.progman.shell"
                    };
                } else {
                    properties = {
                        "text": name,
                        "ui.basic.src": "/packages/res/icons/file.png",
                        "app.folder.args": path,
                        "ui.touch.dblclick": "app.folder.shell"
                    };
                }
                me.set(object, "elements", properties);
                me.notify(object, "update");
            }, path);
        }
    };
    me.args = {
        set: function (object, value) {
            object.args = value;
        }
    };
    me.shell = {
        set: function (object) {
            var args = me.core.cmd.split(object.args);
            if (args) {
                me.launch(args);
            }
        }
    };
};
