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
                    "Copy Url",
                    prefix + "copyUrl",
                    {
                        "separator": true
                    }
                ],
                [
                    "Refresh",
                    prefix + "refresh"
                ],
                prefix + "associated.menu",
                [
                    "Public",
                    "header"
                ],
                prefix + "publicMenu",
                [
                    "Private",
                    "header"
                ],
                prefix + "privateMenu",
                [
                    "Title",
                    "label",
                    {
                        "separator": true
                    }
                ],
                [
                    "",
                    null,
                    {
                        "edit": prefix + "title"
                    }
                ],
                [
                    "Locked",
                    prefix + "locked",
                    {
                        "state": "select"
                    }
                ],
                [
                    "Private",
                    prefix + "private",
                    {
                        "state": "select"
                    }
                ],
                [
                    "Save",
                    prefix + "save",
                    {
                        "enabled": "select",
                        "separator": true
                    }
                ],
                [
                    "Delete",
                    prefix + "delete",
                    {
                        "enabled": "select",
                        "separator": true
                    }
                ]
            ];
        },
        update: function () {
            me.content.publicList = me.manager.content.list(me.id);
            me.content.privateList = me.manager.content.list(me.id, true);
        },
        refresh: {
            set: async function () {
                await me.manager.content.refresh();
                me.content.update();
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
            if (!window.content) {
                window.content = {};
            }
            window.content._title = fullItem.title;
            window.content._private = private;
            window.content._locked = fullItem.locked;
            window.content._owner = fullItem.owner;
            me.content.associated.update(window, fullItem.title);
            me.importData(window, fullItem.content, fullItem.title, fullItem.options);
        },
        importPrivate: async function (object, item) {
            me.content.import(object, item, true);
        },
        publicMenu: function (object) {
            var info = {
                list: me.content.publicList,
                property: "title",
                group: "public",
                itemMethod: me.content.import,
                emptyMsg: "No Content"
            };
            return me.widget.menu.collect(object, info);
        },
        privateMenu: function (object) {
            var info = {
                list: me.content.privateList,
                property: "title",
                group: "private",
                itemMethod: me.content.importPrivate,
                emptyMsg: "No Content"
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
                var private = window.content._private;
                var [content, options] = me.exportData(window);
                var date = new Date();
                var title = "";
                if (window.content._title) {
                    title = window.content._title;
                }
                if (!title) {
                    title = me.core.property.get(window, "widget.window.key");
                }
                if (!title) {
                    title = date.toLocaleDateString();
                }
                var locked = window.content._locked;
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
                    locked: locked
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
                if (window.content) {
                    var locked = window.content._locked;
                    var title = window.content._title;
                    var access = !window.content._owner || window.content._owner === me.core.util.userId || me.core.util.isAdmin;
                    return !locked && title && access;
                }
                return false;
            },
            set: async function (object) {
                var window = me.widget.window.get(object);
                var private = window.content._private;
                var title = "";
                if (window.content._title) {
                    title = window.content._title;
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
                return window.content._title;
            },
            set: function (object) {
                var appName = me.id.split(".").pop();
                var window = me.widget.window.get(object);
                me.core.util.copyUrl(appName, [window.content._title]);
            }
        },
        title: {
            get: function (object) {
                var window = me.widget.window.get(object);
                if (!window.content) {
                    window.content = {};
                }
                return window.content._title;
            },
            set: function (object, title) {
                var window = me.widget.window.get(object);
                if (!window.content) {
                    window.content = {};
                }
                var text = title;
                if (typeof text !== "string") {
                    text = me.core.property.get(object, "ui.basic.text");
                }
                if (window.content._title !== text) {
                    window.content._title = text;
                }
            }
        },
        locked: {
            get: function (object) {
                var window = me.widget.window.get(object);
                if (!window.content) {
                    window.content = {};
                }
                return window.content._locked;
            },
            set: function (object) {
                var window = me.widget.window.get(object);
                if (!window.content) {
                    window.content = {};
                }
                window.content._locked = !window.content._locked;
            }
        },
        private: {
            get: function (object) {
                var window = me.widget.window.get(object);
                if (!window.content) {
                    window.content = {};
                }
                return window.content._private;
            },
            set: function (object) {
                var window = me.widget.window.get(object);
                if (!window.content) {
                    window.content = {};
                }
                window.content._private = !window.content._private;
            }
        },
        associated: {
            update: async function (object, name) {
                var window = me.widget.window.get(object);
                if (!window.content) {
                    window.content = {};
                }
                window.content.associated = new Promise(async resolve => {
                    var list = [];
                    if (name) {
                        var [publicApps, privateApps] = await me.manager.content.associated(name);
                        var playerItems = await me.content.associated.playerItems(name);
                        var publicList = me.content.associated.items(window, name, publicApps);
                        var privateList = me.content.associated.items(window, name, privateApps, true);
                        if (publicList && publicList.length && privateList && privateList.length) {
                            privateList[0][2].separator = true;
                        }
                        list.push(...playerItems);
                        list.push(...publicList);
                        list.push(...privateList);
                    }
                    if (!list.length) {
                        list.push([
                            "No Associated Content",
                            null,
                            {
                                enabled: false
                            },
                            {
                                "group": "associated"
                            }
                        ]);
                    }
                    resolve(list);
                });
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
                if (!window.content) {
                    window.content = {};
                }
                if (!window.content.associated) {
                    me.content.associated.update(window, window.content._title);
                }
                return [[
                    "Associated",
                    "header"
                ], [
                    "",
                    null,
                    {
                        "header": true,
                        "visible": false
                    },
                    {
                        "group": "associated",
                        "promise": { promise: window.content.associated }
                    }
                ]];
            }
        }
    };
    return me.content;
};
