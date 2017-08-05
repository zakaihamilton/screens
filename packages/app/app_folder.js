/*
 @author Zakai Hamilton
 @component AppFolder
 */

package.app.folder = function AppFolder(me) {
    me.launch = function (args) {
        var path=args[0];
        var item = me.storage.file[path];
        var json = __json__;
        json.title = item.name;
        json["app.folder.path"] = path;
        json["ui.basic.elements"] = "app.folder.items";
        return me.ui.element.create(json);
    };
    me.path = {
        get: function(object) {
            return object.value;
        },
        set: function(object, value) {
            object.value = value;
        }
    };
    me.items = {
        get: function(object) {
            var window = me.widget.window.window(object);
            var path = me.get(window, "app.folder.path");
            var item = me.storage.file[path];
            var members = me.storage.file.members(item);
            var children = members.map(function(member) {
                var item = null;
                var memberPath = path + "/" + member.name;
                if(member.members) {
                    item = {
                        "text": member.name,
                        "ui.basic.src": "/packages/res/icons/folder.png",
                        "app.progman.args": memberPath,
                        "ui.touch.dblclick": "app.progman.shell"
                    };
                }
                else {
                    item = {
                        "text": member.name,
                        "ui.basic.src": "/packages/res/icons/file.png",
                        "app.folder.args": memberPath,
                        "ui.touch.dblclick": "app.folder.shell"
                    };
                }
                return item;
            });
            return children;
        },
        set: function(object, value) {
            
        }
    };
    me.args = {
        set: function (object, value) {
            object.args = value;
        }
    };
    me.shell = {
        set: function(object) {
            var args = me.core.cmd.splitArguments(object.args);
            if (args) {
                me.launch(args);
            }
        }
    };
};
