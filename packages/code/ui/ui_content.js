/*
 @author Zakai Hamilton
 @component UIContent
 */

screens.ui.content = function UIContent(me) {
    me.content = {
        init: async function () {
            if (!me.ui.content.lists) {
                me.ui.content.lists = me.manager.content.lists();
            }
            me.content.update();
        },
        info: function (window) {
            if (!window.content) {
                window.content = { _locked: true };
            }
            return window.content;
        },
        menu: function () {
            var prefix = me.id + ".content.";
            return [
                [
                    "Copy Url",
                    prefix + "copyUrl"
                ],
                [
                    "Refresh",
                    prefix + "refresh"
                ],
                prefix + "associated.menu",
                {
                    "text": "Public",
                    "select": [
                        prefix + "publicMenu"
                    ],
                    "options": {
                        "visible": prefix + "hasPublic",
                        "separator": true
                    }
                },
                {
                    "text": "Private",
                    "select": [
                        prefix + "privateMenu"
                    ],
                    "options": {
                        "visible": prefix + "hasPrivate"
                    }
                },
                {
                    "text": "Title",
                    "select": "label",
                    "options": {
                        "separator": true
                    }
                },
                {
                    "text": "",
                    "options": {
                        "edit": prefix + "title"
                    }
                },
                {
                    "text": "Locked",
                    "select": prefix + "locked",
                    "options": {
                        "state": "select"
                    }
                },
                {
                    "text": "Private",
                    "select": prefix + "private",
                    "options": {
                        "state": "select"
                    }
                },
                {
                    "text": "Save",
                    "select": prefix + "save",
                    "options": {
                        "enabled": "select",
                        "separator": true
                    }
                },
                {
                    "text": "Delete",
                    "select": prefix + "delete",
                    "options": {
                        "enabled": "select",
                        "separator": true
                    }
                }
            ];
        },
        update: async function () {
            var [package, component] = me.id.split(".");
            var lists = await me.ui.content.lists;
            var filter = item => item.package === package && item.component === component;
            me.content.publicList = lists.publicList.filter(filter);
            me.content.privateList = lists.privateList.filter(filter);
        },
        refresh: {
            set: async function (object) {
                var window = me.widget.window.get(object);
                me.ui.content.lists = me.manager.content.lists();
                await me.content.update();
                var info = me.content.info(window);
                me.content.associated.update(window, info._title);
            }
        },
        get: async function (item, private) {
            var name = item;
            if (typeof item === "object") {
                name = item.key.name;
            }
            var fullItem = await me.manager.content.load(me.id, name, private);
            return [fullItem.content, fullItem.title, fullItem.options];
        },
        import: async function (object, item, private) {
            var window = me.widget.window.get(object);
            var name = item;
            if (typeof item !== "string") {
                name = item.key.name;
            }
            var fullItem = await me.manager.content.load(me.id, name, private);
            if (!fullItem) {
                return;
            }
            var info = me.content.info(window);
            info._title = fullItem.title;
            info._private = private;
            info._locked = fullItem.locked;
            info._owner = fullItem.owner;
            await me.content.associated.update(window, fullItem.title);
            me.importData(window, fullItem.content, fullItem.title, fullItem.options);
        },
        importPrivate: async function (object, item) {
            me.content.import(object, item, true);
        },
        hasPublic: function () {
            return me.content.publicList && me.content.publicList.length;
        },
        hasPrivate: function () {
            return me.content.publicList && me.content.privateList.length;
        },
        publicMenu: function (object) {
            var info = {
                list: me.content.publicList,
                property: "title",
                group: "public",
                reverse: true,
                sort: true,
                itemMethod: me.content.import
            };
            return me.widget.menu.collect(object, info);
        },
        privateMenu: function (object) {
            var info = {
                list: me.content.privateList,
                property: "title",
                group: "private",
                reverse: true,
                sort: true,
                itemMethod: me.content.importPrivate
            };
            return me.widget.menu.collect(object, info);
        },
        save: {
            get: function (object) {
                var window = me.widget.window.get(object);
                var [content] = me.exportData(window);
                return content;
            },
            set: async function (object) {
                var window = me.widget.window.get(object);
                var info = me.content.info(window);
                var private = info._private;
                var [content, options] = me.exportData(window);
                var date = new Date();
                var title = "";
                var json = false;
                if (typeof content !== "string") {
                    content = JSON.stringify(content);
                    json = true;
                }
                if (info._title) {
                    title = me.core.string.title(info._title);
                }
                if (!title) {
                    title = me.core.property.get(window, "widget.window.key");
                }
                if (!title) {
                    title = date.toLocaleDateString();
                }
                var locked = info._locked;
                if (!locked) {
                    locked = false;
                }
                var data = {
                    content: content,
                    date: date.toString(),
                    title: title,
                    user: "$userId",
                    options: {},
                    owner: "$userId",
                    locked: locked,
                    json
                };
                if (options) {
                    data.options = options;
                }
                await me.manager.content.save(me.id, title, data, private);
                await me.content.refresh.set(object);
            }
        },
        delete: {
            get: function (object) {
                var window = me.widget.window.get(object);
                var info = me.content.info(window);
                if (info) {
                    var locked = info._locked;
                    var title = info._title;
                    var access = !info._owner || info._owner === me.core.util.userId || me.core.util.isAdmin;
                    return !locked && title && access;
                }
                return false;
            },
            set: async function (object) {
                var window = me.widget.window.get(object);
                var info = me.content.info(window);
                var private = info._private;
                var title = "";
                if (info._title) {
                    title = info._title;
                }
                if (!title) {
                    title = me.core.property.get(window, "widget.window.key");
                }
                if (!title) {
                    var date = new Date();
                    title = date.toLocaleDateString();
                }
                await me.manager.content.delete(me.id, title, private);
                await me.content.refresh.set(object);
            }
        },
        copyUrl: {
            get: function (object) {
                var window = me.widget.window.get(object);
                var info = me.content.info(window);
                return info._title;
            },
            set: function (object) {
                var appName = me.id.split(".").pop();
                var window = me.widget.window.get(object);
                var info = me.content.info(window);
                me.core.util.copyUrl(appName, [info._title]);
            }
        },
        title: {
            get: function (object) {
                var window = me.widget.window.get(object);
                var info = me.content.info(window);
                return info._title;
            },
            set: function (object, title) {
                var window = me.widget.window.get(object);
                var info = me.content.info(window);
                var text = title;
                if (typeof text !== "string") {
                    text = me.core.property.get(object, "ui.basic.text");
                }
                if (info._title !== text) {
                    info._title = text;
                    me.content.associated.update(window, info._title);
                }
            }
        },
        locked: {
            get: function (object) {
                var window = me.widget.window.get(object);
                var info = me.content.info(window);
                return info._locked;
            },
            set: function (object) {
                var window = me.widget.window.get(object);
                var info = me.content.info(window);
                info._locked = !info._locked;
            }
        },
        private: {
            get: function (object) {
                var window = me.widget.window.get(object);
                var info = me.content.info(window);
                return info._private;
            },
            set: function (object) {
                var window = me.widget.window.get(object);
                var info = me.content.info(window);
                info._private = !info._private;
            }
        },
        search: async function (text) {
            var results = [];
            await me.content.update();
            var lists = { public: me.content.publicList, private: me.content.privateList };
            for (var listType in lists) {
                for (var item of lists[listType]) {
                    if (item.title.toLowerCase().includes(text)) {
                        results.push(Object.assign({}, item, {
                            args: [me.id.split(".").pop(), item.title, listType == "private"]
                        }));
                    }
                }
            }
            results = results.sort((a, b) => a.title.localeCompare(b.title));
            results.reverse();
            return results;
        },
        associated: {
            update: async function (object, name) {
                var window = me.widget.window.get(object);
                var info = me.content.info(window);
                var list = [];
                if (name) {
                    var { publicList, privateList } = await me.manager.content.associated(name);
                    var playerItems = await me.content.associated.playerItems(name);
                    publicList = me.content.associated.items(window, name, publicList);
                    privateList = me.content.associated.items(window, name, privateList, true);
                    if (publicList && publicList.length && privateList && privateList.length) {
                        privateList[0][2].separator = true;
                    }
                    list.push(...playerItems);
                    list.push(...publicList);
                    list.push(...privateList);
                }
                info.associated = list;
            },
            playerItems: async function (name) {
                var list = [];
                if ("app.player" === me.id) {
                    return [];
                }
                var group = await me.media.file.exists(name);
                if (group) {
                    list.push([
                        "Player",
                        (object, appName) => {
                            me.core.app.launch(appName.toLowerCase(), group, name);
                        },
                        {

                        },
                        {
                            "group": "associated"
                        }
                    ]);
                }
                return list;
            },
            items: function (object, name, apps, private) {
                if (!apps) {
                    return [];
                }
                var list = [];
                for (var app in apps) {
                    if ("app." + app === me.id) {
                        continue;
                    }
                    var title = me.core.string.title(app);
                    list.push([
                        title,
                        (object, appName) => {
                            me.core.app.launch(appName.toLowerCase(), name, private);
                        },
                        {

                        },
                        {
                            "group": "associated"
                        }
                    ]);
                }
                return list;
            },
            menu: function (object) {
                var window = me.widget.window.get(object);
                var info = me.content.info(window);
                if (!info.associated || !info.associated.length) {
                    return null;
                }
                return [{
                    "text": "Associated",
                    "options": {
                        "separator": true
                    },
                    "select": [
                        {
                            "text": "",
                            "options": {
                                "header": true,
                                "visible": false
                            },
                            "properties": {
                                "group": "associated",
                                "promise": { promise: info.associated }
                            }
                        }
                    ]
                }];
            }
        }
    };
    return me.content;
};
