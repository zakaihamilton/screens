/*
 @author Zakai Hamilton
 @component AppFolder
 */

screens.app.folder = function AppFolder(me) {
    me.launch = async function (args) {
        var path = args[0];
        if (!path || typeof path !== "string") {
            path = "file";
        }
        title = "Folder: " + path;
        var items = await me.core.object.get(path);
        var params = {
            path,
            title,
            items
        }
        return me.ui.element.create(__json__, "workspace", "self", params);
    };
    me.init = async function () {
        me.apps = await me.user.access.appList();
    };
    me.resIcon = async function (object, info) {
        me.core.property.set(object, "text", info.name);
        if (info.type === "folder") {
            me.core.property.set(object, "ui.basic.src", `/packages/res/icons/folder.svg`);
        }
        else {
            me.core.property.set(object, "ui.basic.src", `/packages/res/icons/file.png`);
        }
        me.core.property.set(object, "ui.touch.click", `core.app.folder(${info.path})`);
    };
    me.items = function (object, items) {
        if (items && typeof items === "object") {
            var results = [];
            for (var name in items) {
                var info = items[name];
                results.push([info]);
            }
            return results;
        }
    };
};
