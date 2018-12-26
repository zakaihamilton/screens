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
                ]
            ];
        },
        update: function () {
            me.content.publicList = me.manager.content.list(me.id);
            me.content.privateList = me.manager.content.list(me.id, true);
        },
        refresh: {
            set: async function (object) {
                me.manager.content.refresh();
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
                itemMethod: me.content.import
            };
            return me.widget.menu.collect(object, info);
        },
        privateMenu: function (object) {
            var info = {
                list: me.content.privateList,
                property: "title",
                group: "private",
                itemMethod: me.content.importPrivate,
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
            set: function (object) {
                var window = me.widget.window.get(object);
                if (!window.content) {
                    window.content = {};
                }
                var text = me.core.property.get(object, "ui.basic.text");
                window.content._title = text;
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
        }
    };
    return me.content;
};
