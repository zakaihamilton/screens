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
        me.core.property.link("widget.transform.clear", "app.library.clear", true);
    };
    me.refresh = async function () {
        me.tagList = me.db.library.tags.list();
    };
    me.initOptions = async function (object) {
        var window = me.widget.window(object);
        me.ui.options.load(me, window, {
            editMode: false,
            structuredMode: false
        });
        me.ui.options.toggleSet(me, "editMode", me.updateEditMode.set);
        me.ui.options.toggleSet(me, "structuredMode", me.updateEditMode.set);
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
            me.core.property.set([window.var.editor, window.var.editorContainer, window.var.delete, window.var.update], "ui.basic.show", editMode);
            me.updateText(object);
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
    me.clear = function (object) {
        var window = me.widget.window.window(object);
        me.core.property.set(window.var.search, "ui.basic.text", "");
        me.reset(object);
    };
    me.reset = function (object) {
        var window = me.widget.window.window(object);
        me.core.property.set(window.var.editor, "text", "");
        me.core.property.set(window.var.transform, "text", "");
        me.core.property.set(window.var.transform, "transform");
        window.searchText = "";
    };
    me.search = async function (object) {
        var window = me.widget.window.window(object);
        var search = me.core.property.get(window.var.search, "ui.basic.text");
        if (search === window.searchText) {
            return;
        }
        me.reset(object);
        window.searchText = search;
        clearTimeout(me.searchTimer);
        var text = "";
        if (search) {
            var records = await me.db.library.find(0, search);
            me.updateTextFromRecords(window, records);
        }
    };
    me.updateText = function (object) {
        var window = me.widget.window.window(object);
        var records = me.parseRecordsFromText(window);
        me.updateTextFromRecords(object, records);
    };
    me.removeExtra = function (json) {
        json = Object.assign({}, json);
        delete json._id
        delete json.user
        return json;
    };
    me.addExtra = function (json, record) {
        json = Object.assign({}, json);
        json._id = record.id || record._id;
        json.user = record.user || 0;
        return json;
    };
    me.updateTextFromRecords = function (object, records) {
        var window = me.widget.window.window(object);
        var json = me.toRecordArray(records);
        var structuredMode = window.options.structuredMode;
        var text = "";
        if(structuredMode) {
            text = JSON.stringify(json, null, 4);
        }
        else {
            for(var item of json) {
                if(item.id) {
                    text += "#id:" + item.id + "\n";
                }
                else {
                    text += "#id:\n";
                }
                if(item.tags) {
                    for(var tag in item.tags) {
                        text += "#" + tag + ":" + item.tags[tag] + "\n"
                    }
                }
                if(item.content && item.content.text) {
                    text += item.content.text;
                }
            }
        }
        var transformText = "";
        if(records.content) {
            transformText = records.content.map(record => record.text).join("<article>");
        }
        me.core.property.set(window.var.editor, "text", text);
        me.core.property.set(window.var.transform, "text", transformText);
        me.core.property.set(window.var.transform, "transform");
    };
    me.parseRecordsFromText = function (object) {
        var window = me.widget.window.window(object);
        var text = me.core.property.get(window.var.editor, "text");
        var records = {};
        var array = [];
        if(text) {
            if(text[0] === "[") {
                array = JSON.parse(text);
            }
            else {
                for(line of text.split("\n")) {
                    var last = array[array.length - 1];
                    if(line[0] === "#") {
                        var [key, value] = line.substring(1).split(":").map(string => string.trim());
                        if(key === "id") {
                            array.push({id:value});
                        }
                        else {
                            if(!last) {
                                array.push({});
                                last = array[array.length - 1];
                            }
                            if(!last.tags) {
                                last.tags = {};
                            }
                            last.tags[key] = value;
                        }
                    }
                    else {
                        if(!last) {
                            array.push({});
                            last = array[array.length - 1];
                        }
                        if(last.content && last.content.text) {
                            last.content.text += "\n" + line;
                        }
                        else {
                            last.content = {text:line};
                        }
                    }
                }
            }
            records = me.fromRecordArray(array);
        }
        return records;
    };
    me.toRecordArray = function (json) {
        var array = [];
        if(json.content) {
            var ids = json.content.map(item => item._id);
            for (var id of ids) {
                var tags = json.tags.find(item => item._id === id);
                var content = json.content.find(item => item._id === id);
                array.push({
                    id: id,
                    tags: me.removeExtra(tags),
                    content: me.removeExtra(content)
                });
            }
        }
        return array;
    };
    me.fromRecordArray = function (array) {
        var dict = { tags: [], content: [], ids: [] };
        for (record of array) {
            dict.tags.push(me.addExtra(record.tags, record));
            dict.content.push(me.addExtra(record.content, record));
            dict.ids.push(record.id);
        }
        return dict;
    };
    me.updateRecord = async function (object) {
        var records = me.parseRecordsFromText(object);
        if (records.content) {
            records.content = await me.db.library.content.set(records.content);
            records.ids = records.content.map(item => item._id);
        }
        if (records.tags) {
            for (var index = 0; index < records.tags.length; index++) {
                records.tags[index] = me.addExtra(records.tags[index], records.content[index]);
            }
            records.tags = await me.db.library.tags.set(records.tags);
            records.ids = records.tags.map(item => item._id);
        }
        me.updateTextFromRecords(object, records);
        me.refresh();
    };
    me.deleteRecord = async function (object) {
        var records = me.parseRecordsFromText(object);
        if (records.ids) {
            await me.db.library.tags.remove(records.ids);
            await me.db.library.content.remove(records.ids);
        }
    };
};
