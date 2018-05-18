/*
 @author Zakai Hamilton
 @component AppTransform
 */

screens.app.transform = function AppTransform(me) {
    me.launch = function (args) {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element(__json__, "workspace", "self");
    };
    me.init = function() {
        me.core.property.link("widget.transform.clear", "app.transform.clearEvent", true);
        me.updateContentList();
    };
    me.initOptions = {
        set: function (object) {
            var window = me.widget.window.mainWindow(object);
            window.language = null;
            me.ui.options.load(me, window, {
                showInput: false
            });
            me.ui.options.toggleSet(me, null, "showInput", function (object, value, key, options) {
                var window = me.widget.window.mainWindow(object);
                var text = me.core.property.get(window.var.transform, "text");
                if (!text) {
                    value = true;
                }
                me.updateWidgets(window, value);
                me.core.property.set(window.var.transform, "reflow");
            });
            me.core.property.set(window, "app", me);
            me.ui.class.useStylesheet("kab");
        }
    };
    me.updateWidgets = function (object, showInput, update = true) {
        var window = me.widget.window.mainWindow(object);
        me.core.property.set([window.var.input,window.var.doTransform], "ui.style.display", showInput ? "inline-block" : "none");
        me.core.property.set(window.var.transform, "ui.style.top", showInput ? "250px" : "0px");
        if (update) {
            me.core.property.notify(window, "update");
        }
    };
    me.clearEvent = {
        set: function (object) {
            var window = me.widget.window.mainWindow(object);
            me.core.property.set(window.var.input, {
                "ui.basic.text": "",
                "storage.local.store": ""
            });
            me.updateWidgets(window, true);
        }
    };
    me.transform = {
        set: function (object) {
            var window = me.widget.window.mainWindow(object);
            me.core.property.set(window.var.input, "ui.basic.save");
            var text = me.core.property.get(window.var.input, "ui.basic.text");
            me.updateWidgets(window, window.options.showInput || !text, false);
            if (!text) {
                return;
            }
            me.core.property.set(window.var.transform, "text", text);
            me.core.property.set(window.var.transform, "transform");
        }
    };
    me.updateContentList = function() {
        me.publicContentList = me.core.message.send_server("core.cache.use",
            me.id + ".public",
            "storage.data.query",
            "app.transform.content",
            "title");
        me.privateContentList = me.core.message.send_server("core.cache.use",
            me.id + ".private.$userId",
            "storage.data.query",
            "app.transform.content.$userId",
            "title");
    };
    me.refreshContentList = {
        set: async function (object) {
            await me.core.message.send_server("core.cache.reset", me.id + ".public");
            await me.core.message.send_server("core.cache.reset", me.id + ".private.$userId");
            me.updateContentList();
        }
    };
    me.importData = function(object, text) {
        var window = me.widget.window.mainWindow(object);
        me.core.property.set(window.var.input, "ui.basic.text", text);
        me.core.property.set(window, "app.transform.transform");
    };
    me.importItem = async function (object, item) {
        var window = me.widget.window.mainWindow(object);
        var name = item;
        if(typeof item !== "string") {
            name = item.key.name;
        }
        var fullItem = await me.storage.data.load("app.transform.content", name);
        var content = me.core.string.decode(fullItem.content);
        me.importData(window, content);
    },
    me.publicContentMenuList = {
        get: function (object) {
            return me.widget.menu.collect(object, me.publicContentList, "title", null, "public", null, me.importItem);
        }
    };
    me.privateContentMenuList = {
        get: function (object) {
            return me.widget.menu.collect(object, me.privateContentList, "title", null, "private", null, me.importItem);
        }
    };
    me.documentIndex = {
        set: function (object, value) {
            var title = value;
            if(!isNaN(value)) {
                title = "Document " + value;
            }
            me.core.property.set(object, "widget.window.key", title);
            me.core.property.set(object, "widget.window.title", title);
        }
    };
    me.title = {
        get: function (object) {
            var window = me.widget.window.mainWindow(object);
            var title = me.core.property.get(window.var.transform, "widget.transform.contentTitle");
            var key = me.core.property.get(window, "widget.window.key");
            if (title) {
                return key + " - " + title;
            }
            return key;
        }
    };
    me.savePublic = {
        get: function (object) {
            var window = me.widget.window.mainWindow(object);
            var text = me.core.property.get(window.var.transform, "text");
            return text;
        },
        set: function (object) {
            me.save(object);
        }
    };
    me.savePrivate = {
        get: function (object) {
            var window = me.widget.window.mainWindow(object);
            var text = me.core.property.get(window.var.transform, "text");
            return text;
        },
        set: function (object) {
            me.save(object, true);
        }
    };
    me.save = async function (object, private) {
        var window = me.widget.window.mainWindow(object);
        var text = me.core.property.get(window.var.transform, "text");
        var date = new Date();
        var title = me.core.property.get(window.var.transform, "widget.transform.contentTitle");
        var key = me.core.property.get(window, "widget.window.key");
        if (!title) {
            title = key;
        }
        if (!title) {
            title = date.toLocaleDateString();
        }
        var data = {
            content: me.core.string.encode(text),
            date: date.toString(),
            title: title,
            user: "$userId"
        };
        var kind = "app.transform.content";
        if (private) {
            data.owner = "$userId";
            kind += ".$userId";
        }
        await me.storage.data.save(data, kind, title, ["content"]);
        await me.refreshContentList.set(object);
    };
};
