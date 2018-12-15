/*
 @author Zakai Hamilton
 @component UIContent
 */

screens.ui.content = function UIContent(me) {
    me.content = {
        init: function () {
            me.content.update();
        },
        menu: function () {
            var prefix = me.id + ".content.";
            return [
                [
                    "Refresh",
                    prefix + "refresh"
                ],
                [
                    "Copy Url",
                    prefix + "copyUrl",
                    {
                        "separator": true
                    }
                ],
                [
                    "Public",
                    "header"
                ],
                prefix + "publicMenu",
                [
                    "Save",
                    prefix + "savePublic",
                    {
                        "enabled": "select",
                        "separator": true,
                        "unique": false
                    }
                ],
                [
                    "Private",
                    "header"
                ],
                prefix + "privateMenu",
                [
                    "Save",
                    prefix + "savePrivate",
                    {
                        "enabled": "select",
                        "separator": true,
                        "unique": false
                    }
                ]
            ];
        },
        update: function () {
            me.content.publicList = me.core.message.send_server("core.cache.use",
                me.id + ".public",
                "storage.data.query",
                me.id + ".content",
                "title");
            me.content.privateList = me.core.message.send_server("core.cache.use",
                me.id + ".private.$userId",
                "storage.data.query",
                me.id + ".content.$userId",
                "title");
        },
        refresh: {
            set: async function (object) {
                await me.core.message.send_server("core.cache.reset", me.id + ".public");
                await me.core.message.send_server("core.cache.reset", me.id + ".private.$userId");
                me.content.update();
            }
        },
        import: async function (object, item) {
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
        },
        importPrivate: async function (object, item) {
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
        },
        publicMenu: function (object) {
            return me.widget.menu.collect(object, me.content.publicList, "title", null, "public", null, me.content.import);
        },
        privateMenu: function (object) {
            return me.widget.menu.collect(object, me.content.privateList, "title", null, "private", null, me.content.importPrivate);
        },
        savePublic: {
            get: function (object) {
                var window = me.widget.window.get(object);
                var [content] = me.exportData(window);
                return content;
            },
            set: function (object) {
                me.content.save(object);
            }
        },
        savePrivate: {
            get: function (object) {
                var window = me.widget.window.get(object);
                var [content] = me.exportData(window);
                return content;
            },
            set: function (object) {
                me.content.save(object, true);
            }
        },
        save: async function (object, private) {
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
            await me.content.refresh.set(object);
        },
        copyUrl: {
            get: function (object) {
                var window = me.widget.window.get(object);
                var [content, title] = me.exportData(window);
                return title !== "Table";
            },
            set: function (object) {
                var appName = me.id.split(".").pop();
                var window = me.widget.window.get(object);
                var [content, title] = me.exportData(window);
                me.core.util.copyUrl(appName, [title]);
            }
        }
    };
    return me.content;
};
