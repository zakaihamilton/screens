/*
 @author Zakai Hamilton
 @component UIContent
 */

screens.ui.content = function UIContent(me, packages) {
    const { core, ui, manager } = packages;
    me.content = {
        init: async function () {
        },
        info: function (window) {
            if (!window.content) {
                window.content = { _locked: true, _private: true };
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
        update: function () {
            var [package, component] = me.id.split(".");
            var lists = ui.content.data.lists;
            var filter = item => item.package === package && item.component === component;
            me.content.publicList = lists.publicList.filter(filter);
            me.content.privateList = lists.privateList.filter(filter);
        },
        refresh: async function (object) {
            var window = me.widget.window.get(object);
            let lists = await me.manager.content.lists();
            ui.content.data.setLists(lists);
            me.content.update();
            var info = me.content.info(window);
            me.content.associated.update(window, info._title);
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
            var title = item;
            if (typeof item !== "string") {
                title = item.key.name;
                if (!title) {
                    title = item.title;
                }
            }
            var fullItem = await me.manager.content.load(me.id, title, private);
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
                itemMethod: me.content.import,
                metadata: {
                    "Name": "title",
                    "User": "user"
                }
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
                    title = core.string.title(info._title);
                }
                if (!title) {
                    title = core.property.get(window, "widget.window.key");
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
                ui.modal.launch("question", {
                    "title": "Save Content",
                    "question": "Do you want to <b>save</b> the following <b>" +
                        (private ? "private" : "public") +
                        "</b> content:<br/>" + title + "?"
                }).then(async () => {
                    await me.manager.content.save(me.id, title, data, private);
                    await me.content.refresh(object);
                }).catch(() => {

                });
            }
        },
        delete: {
            get: function (object) {
                var window = me.widget.window.get(object);
                var info = me.content.info(window);
                if (info) {
                    var locked = info._locked;
                    var private = info._private;
                    var title = info._title;
                    var access = !info._owner || info._owner === core.util.info.userId || core.util.info.admin;
                    var exists = manager.content.exists(me.id, title, private);
                    return !locked && title && access && exists;
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
                    title = core.property.get(window, "widget.window.key");
                }
                if (!title) {
                    var date = new Date();
                    title = date.toLocaleDateString();
                }
                ui.modal.launch("question", {
                    "title": "Delete Content",
                    "question": "Do you want to <b>delete</b> the following <b>" +
                        (private ? "private" : "public") +
                        "</b> content:<br/>" + title + "?"
                }).then(async () => {
                    await manager.content.delete(me.id, title, private);
                    await me.content.refresh(object);
                }).catch(() => {

                });
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
                core.util.copyUrl(appName, [info._title]);
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
                    text = core.property.get(object, "ui.basic.text");
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
                            args: ["core.app.launch", me.id.split(".").pop(), item.title, listType == "private"]
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
                    var lists = await me.manager.content.associated(name);
                    if (lists) {
                        var { publicList, privateList } = lists;
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
                            core.app.launch(appName.toLowerCase(), group, name);
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
                    var title = core.string.title(app);
                    list.push([
                        title,
                        (object, appName) => {
                            core.app.launch(appName.toLowerCase(), name, private);
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

screens.ui.content.data = function (me, packages) {
    me.ready = function (methods) {
        methods["ui.content.data.setLists"] = ["manager.content.lists"];
    };
    me.setLists = function (lists) {
        me.lists = lists;
    };
};
