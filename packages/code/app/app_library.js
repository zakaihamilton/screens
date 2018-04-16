/*
 @author Zakai Hamilton
 @component AppLibrary
 */

screens.app.library = function AppLibrary(me) {
    me.launch = function (args) {
        return me.ui.element(__json__, "workspace", "self");
    };
    me.init = async function () {
        me.tagList = me.db.library.tags.list();
    };
    me.refresh = async function () {
        me.tagList = me.db.library.tags.list();
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
                            search += " AND ";
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
        me.core.property.set(window.var.editor, "text", "");
        me.core.property.set(window.var.transform, "text", "");
        me.core.property.set(window.var.transform, "transform");
    };
    me.search = async function (object) {
        var window = me.widget.window.window(object);
        var search = me.core.property.get(window.var.search, "ui.basic.text");
        if(search === window.searchText) {
            return;
        }
        window.searchText = search;
        me.reset(object);
        clearTimeout(me.searchTimer);
        var text = "";
        if (search) {
            var records = await me.db.library.find(0, search);
            text = JSON.stringify(me.toRecordArray(records),null,4);
        }
        me.core.property.set(window.var.editor, "text", text);
        me.updateText(object);
        me.core.property.set(window.var.transform, "transform");
    };
    me.updateText = function(object) {
        var window = me.widget.window.window(object);
        var records = me.parseRecords(window);
        var text = records.content.map(record => record.text).join("<article>");
        me.core.property.set(window.var.transform, "text", text);
    };
    me.removeExtra = function(json) {
        json = Object.assign({}, json);
        delete json._id
        delete json.user
        return json;
    };
    me.addExtra = function(json, record) {
        json = Object.assign({}, json);
        json._id = record.id;
        json.user = record.user;
        return json;
    };
    me.toRecordArray = function(json) {
        var array = [];
        for(var id of json.ids) {
            var tags = json.tags.find(item => item._id === id);
            var content = json.content.find(item => item._id === id);
            array.push({
                id:id,
                tags:me.removeExtra(tags),
                content:me.removeExtra(content)
            });
        }
        return array;
    };
    me.fromRecordArray = function(array) {
        var dict = {tags:[], content:[], ids:[]};
        for(record of array) {
            dict.tags.push(me.addExtra(record.tags, record));
            dict.content.push(me.addExtra(record.content, record));
            dict.ids.push(record.id);
        }
        return dict;
    };
    me.parseRecords = function(object) {
        var window = me.widget.window.window(object);
        var text = me.core.property.get(window.var.editor, "text");
        var records = me.fromRecordArray(JSON.parse(text));
        return records;
    };
    me.updateRecord = async function(object) {
        var records = me.parseRecords(object);
        if(records.tags) {
            await me.db.library.tags.replace(records.tags);
        }
        if(records.content) {
            await me.db.library.content.replace(records.content);
        }
    };
    me.deleteRecord = async function(object) {
        var records = me.parseRecords(object);
        if(records.ids) {
            await me.db.library.tags.remove(records.ids);
            await me.db.library.content.remove(records.ids);
        }
    };
};
