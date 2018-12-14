/*
 @author Zakai Hamilton
 @component UIContent
 */

screens.ui.content = function UIContent(me) {
    me.updateContentList = function () {
        me.publicContentList = me.core.message.send_server("core.cache.use",
            me.id + ".public",
            "storage.data.query",
            me.id + ".content",
            "title");
        me.privateContentList = me.core.message.send_server("core.cache.use",
            me.id + ".private.$userId",
            "storage.data.query",
            me.id + ".content.$userId",
            "title");
    };
    me.refreshContentList = {
        set: async function (object) {
            await me.core.message.send_server("core.cache.reset", me.id + ".public");
            await me.core.message.send_server("core.cache.reset", me.id + ".private.$userId");
            me.updateContentList();
        }
    };
    me.importItem = async function (object, item) {
        var window = me.widget.window.get(object);
        var name = item;
        if (typeof item !== "string") {
            name = item.key.name;
        }
        var fullItem = await me.storage.data.load(me.id + ".content", name);
        var content = "";
        if (fullItem) {
            content = me.core.string.decode(fullItem.content);
        }
        me.importData(window, content, fullItem.title, fullItem.options);
    };
    me.importItemPrivate = async function (object, item) {
        var window = me.widget.window.get(object);
        var name = item;
        if (typeof item !== "string") {
            name = item.key.name;
        }
        var fullItem = await me.storage.data.load(me.id + ".content.$userId", name);
        var content = "";
        if (fullItem) {
            content = me.core.string.decode(fullItem.content);
        }
        me.importData(window, content, fullItem.title, fullItem.options);
    };
    me.publicContentMenuList = {
        get: function (object) {
            return me.widget.menu.collect(object, me.publicContentList, "title", null, "public", null, me.importItem);
        }
    };
    me.privateContentMenuList = {
        get: function (object) {
            return me.widget.menu.collect(object, me.privateContentList, "title", null, "private", null, me.importItemPrivate);
        }
    };
    me.savePublic = {
        get: function (object) {
            var window = me.widget.window.get(object);
            var [content] = me.exportData(window);
            return content;
        },
        set: function (object) {
            me.save(object);
        }
    };
    me.savePrivate = {
        get: function (object) {
            var window = me.widget.window.get(object);
            var [content] = me.exportData(window);
            return content;
        },
        set: function (object) {
            me.save(object, true);
        }
    };
    me.save = async function (object, private) {
        var window = me.widget.window.get(object);
        var [content, title, options] = me.exportData(window);
        var date = new Date();
        var key = me.core.property.get(window, "widget.window.key");
        if (!title) {
            title = key;
        }
        if (!title) {
            title = date.toLocaleDateString();
        }
        var data = {
            content: me.core.string.encode(content),
            date: date.toString(),
            title: title,
            user: "$userId",
            options: {}
        };
        if (options) {
            data.options = options;
        }
        var kind = me.id + ".content";
        if (private) {
            data.owner = "$userId";
            kind += ".$userId";
        }
        await me.storage.data.save(data, kind, title, ["content"]);
        await me.refreshContentList.set(object);
    };
};
