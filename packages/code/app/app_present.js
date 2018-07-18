/*
 @author Zakai Hamilton
 @component AppPresent
 */

screens.app.present = function AppPresent(me) {
    me.init = function() {
        me.userList = null;        
    };
    me.launch = function (args) {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element(__json__, "workspace", "self");
    };
    me.initOptions = async function (object) {
        var window = me.widget.window(object);
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
    me.importData = function (object, text) {
        var window = me.widget.window(object);
        me.core.property.set(window.var.editor, "text", text);
        me.core.property.set(window.var.editor, "ui.basic.save");
        window.options.userName = "";
        me.updateEditMode(window);
    };
    me.updateDb = async function(object) {
        var window = me.widget.window(object);
        var text = me.core.property.get(window.var.editor, "text");
        if(text) {
            me.db.shared.present.use({
                "user":"$userId"
            }, {
                "user":"$userId",
                "name":"$userName",
                "content":text
            });
        }
        else {
            me.db.shared.present.remove({
                "user":"$userId"
            });
        }
        me.refreshList(object);
    };
    me.updateEditMode = function (object) {
        var window = me.widget.window(object);
        me.core.property.set(window.var.transform, "ui.style.opacity", window.options.editMode ? "0" : "");
        me.core.property.set([window.var.editor, window.var.editorContainer], "ui.basic.show", window.options.editMode);
        if(!window.options.userName) {
            me.updateDb(window);
        }
        me.updateUser(object);
    };
    me.isThisDevice = function(object) {
        var window = me.widget.window(object);
        return window.options.userName === "";
    };
    me.refreshList = function() {
        me.core.message.send_server("core.cache.reset", me.id);
        me.userList = me.core.message.send_server("core.cache.use",
            me.id,
            "db.shared.present.list");
    };
    me.refresh = function (object) {
        var window = me.widget.window(object);
        me.refreshList(object);
        me.updateUser(window, window.options.userName);
    };
    me.updateUser = async function (object) {
        var window = me.widget.window(object);
        var userName = window.options.userName.toLowerCase();
        var text = "";
        var userList = await me.userList;
        if(userName) {
            text = userList.find((item) => item.name.toLowerCase() === userName).content;
        }
        else {
            text = me.core.property.get(window.var.editor, "text");
        }
        me.core.property.set(window.var.transform, "text", text);
        me.core.property.set(window.var.transform, "transform");
    };
    me.userMenuList = {
        get: function (object) {
            return me.widget.menu.collect(object, me.userList, "name", {"state":"select"}, "users", null, "app.present.userName");
        }
    };
    me.clear = function (object) {
        var window = me.widget.window(object);
        me.core.property.set(window.var.editor, "text", "");
        me.core.property.set(window.var.editor, "ui.basic.save");
        me.updateEditMode(window);
    };
    me.exportText = function (object, target) {
        var window = me.widget.window(object);
        var text = me.core.property.get(window.var.editor, "text");
        me.core.property.set(target, "importData", text);
    };
};
