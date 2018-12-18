/*
 @author Zakai Hamilton
 @component AppPresent
 */

screens.app.present = function AppPresent(me) {
    me.init = function () {
        me.ui.content.attach(me);
        me.userList = null;
    };
    me.launch = async function (args) {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            if (typeof args[0] === "string") {
                await me.content.import(me.singleton, args[0]);
            }
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        var params = {};
        if (typeof args[0] === "string") {
            [params.text, params.title] = await me.content.get(args[0]);
        }
        me.singleton = me.ui.element.create(__json__, "workspace", "self", params);
    };
    me.initOptions = async function (object) {
        var window = me.widget.window.get(object);
        me.ui.options.load(me, window, {
            editMode: false,
            userName: ""
        });
        me.ui.options.choiceSet(me, null, {
            "userName": me.updateUser
        });
        me.ui.options.toggleSet(me, null, {
            "editMode": me.updateEditMode
        });
        me.core.property.set(window, "app", me);
        me.refreshList(window);
        me.updateEditMode(window);
    };
    me.importData = function (object, text, title, options) {
        var window = me.widget.window.get(object);
        me.core.property.set(window.var.editor, "text", text);
        me.core.property.set(window.var.editor, "ui.basic.save");
        window.options.userName = "";
        me.updateEditMode(window);
    };
    me.updateDb = async function (object) {
        var date = new Date();
        var window = me.widget.window.get(object);
        var text = me.core.property.get(window.var.editor, "text");
        if (text) {
            me.db.shared.present.use({
                "user": "$userId"
            }, {
                    user: "$userId",
                    name: "$userName",
                    content: text,
                    date: date.toString()
                });
        }
        else {
            me.db.shared.present.remove({
                user: "$userId"
            });
        }
        me.refreshList(object);
    };
    me.updateEditMode = function (object) {
        var window = me.widget.window.get(object);
        me.core.property.set(window.var.transform, "ui.style.opacity", window.options.editMode ? "0" : "");
        me.core.property.set([window.var.editor, window.var.editorContainer], "ui.basic.show", window.options.editMode);
        if (!window.options.userName) {
            me.updateDb(window);
        }
        me.updateUser(object);
    };
    me.isThisDevice = function (object) {
        var window = me.widget.window.get(object);
        return window.options.userName === "";
    };
    me.refreshList = function () {
        me.userList = me.db.shared.present.list();
    };
    me.refresh = function (object) {
        var window = me.widget.window.get(object);
        me.refreshList(object);
        me.updateUser(window, window.options.userName);
    };
    me.updateUser = async function (object) {
        var window = me.widget.window.get(object);
        var userName = window.options.userName.toLowerCase();
        var text = "";
        var userList = await me.userList;
        if (userName) {
            var user = userList.find((item) => item.name.toLowerCase() === userName);
            if (user) {
                text = user.content;
            }
        }
        else {
            text = me.core.property.get(window.var.editor, "text");
        }
        var previousText = me.core.property.get(window.var.transform, "text");
        if(text !== previousText) {
            me.core.property.set(window.var.transform, "text", text);
            me.core.property.set(window.var.transform, "transform");
        }
    };
    me.userMenuList = {
        get: function (object) {
            return me.widget.menu.collect(object, me.userList, "name", { "state": "select" }, "users", null, "app.present.userName");
        }
    };
    me.clear = function (object) {
        var window = me.widget.window.get(object);
        me.core.property.set(window.var.editor, "text", "");
        me.core.property.set(window.var.editor, "ui.basic.save");
        me.updateEditMode(window);
    };
    me.exportText = function (object, target) {
        var window = me.widget.window.get(object);
        var text = me.core.property.get(window.var.editor, "text");
        me.core.property.set(target, "importData", text);
    };
    me.exportData = function (object) {
        var window = me.widget.window.get(object);
        var text = me.core.property.get(window.var.editor, "text");
        var title = me.core.property.get(window.var.transform, "widget.transform.contentTitle");
        return [text, title];
    };
};
