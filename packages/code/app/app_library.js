/*
 @author Zakai Hamilton
 @component AppLibrary
 */

screens.app.library = function AppLibrary(me) {
    me.launch = function (args) {
        return me.ui.element(__json__, "workspace", "self");
    };
    me.init = async function () {
        me.tagList = me.db.library.tag.list();
    };
    me.refresh = async function () {
        me.tagList = me.db.library.tag.list();
    };
    me.initOptions = async function (object) {
        var window = me.widget.window(object);
        me.ui.options.load(me, window, {
            editMode: false
        });
        me.ui.options.toggleSet(me, "editMode", me.updateEditMode.set);
        me.updateEditMode.set(window);
        me.reset(object);
    };
    me.updateEditMode = {
        get: function (object) {
            var window = me.widget.window(object);
            return window.options.editMode;
        },
        set: function (object) {
            var window = me.widget.window(object);
            var editMode = window.options.editMode;
            me.core.property.set(window.var.transform, "ui.style.opacity", editMode ? "0" : "");
            me.core.property.set([window.var.editor,window.var.editorContainer,window.var.delete,window.var.update], "ui.basic.show", editMode);
            me.updateText(object);
            me.core.property.set(window.var.transform, "transform");
        }
    };
    me.menuList = function (object, list, group) {
        var window = me.widget.window.window(object);
        var parseItems = (items) => {
            var names = new Set();
            if (!items) {
                items = [];
            }
            for (var item of items) {
                for (var key in item) {
                    if (key === "_id" || key === "user") {
                        continue;
                    }
                    names.add(key + ":" + item[key]);
                }
            }
            names = Array.from(names).sort().map((name) => {
                var result = [
                    name,
                    async function () {
                        var search = me.core.property.get(window.var.search, "ui.basic.text");
                        if (search) {
                            if (search.includes(name)) {
                                return;
                            }
                            search += " ";
                        }
                        search += name;
                        me.core.property.set(window.var.search, "ui.basic.text", search);
                        me.changedSearch(window.var.search);
                    },
                    null,
                    {
                        "group": group
                    }
                ];
                return result;
            });
            return names;
        }
        if (list.then) {
            return [[
                "",
                null,
                {
                    "visible": false
                },
                {
                    "group": group,
                    "promise": { promise: list, callback: parseItems }
                }
            ]];
        }
        else {
            items = parseItems(items);
        }
        return items;
    };
    me.tagMenuList = {
        get: function (object) {
            return me.menuList(object, me.tagList, "public");
        }
    };
    me.changedSearch = function (object) {
        if (me.searchTimer) {
            clearTimeout(me.searchTimer);
        }
        me.searchTimer = setTimeout(() => {
            me.searchTimer = null;
            me.search(object);
        }, 2000);
    };
    me.reset = function(object) {
        var window = me.widget.window.window(object);
        window.records = {content:[], tags:[]};
        me.core.property.set(window.var.editor, "text", "");
        me.core.property.set(window.var.transform, "text", "");
        me.core.property.set(window.var.transform, "transform");
    };
    me.search = async function (object) {
        me.reset(object);
        clearTimeout(me.searchTimer);
        var window = me.widget.window.window(object);
        var search = me.core.property.get(window.var.search, "ui.basic.text");
        var text = "";
        if (search) {
            window.records = await me.db.library.find(0, search);
            if (window.records) {
                text = window.records.content.map(item => item.text).join("<article>");
            }
        }
        me.core.property.set(window.var.editor, "text", text);
        me.core.property.set(window.var.transform, "text", text);
        me.core.property.set(window.var.transform, "transform");
    };
    me.updateText = function(object) {
        var window = me.widget.window.window(object);
        var text = me.core.property.get(window.var.editor, "text");
        me.core.property.set(window.var.transform, "text", text);
    };
    me.parseRecords = function(object) {
        var records = {ids:[], tags:{}, content:{}};
        var window = me.widget.window.window(object);
        var text = me.core.property.get(window.var.editor, "text");
        var articles = text.split("<article>");
        
        return records;
    };
    me.updateRecord = async function(object) {
        var records = parseRecords(object);
        if(records.ids) {
            await me.db.tags.update(ids, records.tags);
            await me.db.content.update(ids, records.content);
        }
    };
    me.deleteRecord = async function(object) {
        var records = parseRecords(object);
        if(records.ids) {
            await me.db.tags.remove(ids);
            await me.db.content.remove(ids);
        }
    };
};
