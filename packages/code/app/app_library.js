/*
 @author Zakai Hamilton
 @component AppLibrary
 */

screens.app.library = function AppLibrary(me) {
    me.launch = function (args) {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element(__json__, "workspace", "self");
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
        me.ui.options.toggleSet(me, null, "editMode", me.updateEditMode);
        me.ui.options.toggleSet(me, null, "structuredMode", me.updateMode);
        window.showResults = true;
        me.updateMode(window);
        me.reset(object);
    };
    me.updateEditMode = function(object) {
        me.updateMode(object);
        me.updateText(object);
    };
    me.updateMode = function(object) {
        var window = me.widget.window(object);
        var showResults = window.showResults;
        var editMode = window.options.editMode && !showResults;
        var structuredMode = window.options.structuredMode;
        me.core.property.set(window.var.transform, "ui.style.opacity", showResults || editMode ? "0" : "");
        me.core.property.set([window.var.editor, window.var.editorContainer, window.var.delete, window.var.update], "ui.basic.show", editMode);
        me.core.property.set(window.var.process, "ui.basic.show", !structuredMode && editMode);
        me.core.property.set(window.var.showResults, "ui.basic.show", !showResults);
        me.core.property.set(window.var.resultsContainer, "ui.basic.show", showResults);
    };
    me.cleanSearchText = function(search) {
        search = search.replace(/\s+/g, " ");
        search = search.replace(/AND AND/g, "AND").trim();
        search = search.replace(/^AND/g, "").trim();
        search = search.replace(/AND$/g, "").trim();
        return search;
    };
    me.menuList = function (object, list, group) {
        var window = me.widget.window(object);
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
                        var insert = true;
                        if (search) {
                            var [nameKey, nameValue] = name.split(":");
                            nameKey = nameKey.trim().toLowerCase();
                            search = search.split("AND").map((item) => {
                                if(item.includes(":")) {
                                    var [itemKey] = item.split(":");
                                    itemKey = itemKey.trim().toLowerCase();
                                    if(itemKey === nameKey) {
                                        insert = false;
                                        return " " + name + " ";
                                    }
                                }
                                return item;
                            }).join("AND");
                            search = me.cleanSearchText(search);
                            if(search && insert) {
                                search += " AND ";
                            }
                        }
                        if(insert) {
                            search += name;
                        }
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
        var window = me.widget.window(object);
        me.core.property.set(window.var.search, "ui.basic.text", "");
        me.reset(object);
    };
    me.reset = function (object) {
        var window = me.widget.window(object);
        me.core.property.set(window.var.editor, "text", "");
        me.core.property.set(window.var.transform, "text", "");
        me.core.property.set(window.var.transform, "transform");
        window.searchText = "";
    };
    me.reSearch = function(object) {
        window.searchText = "";
        me.search(object);
    };
    me.search = async function (object) {
        var window = me.widget.window(object);
        var search = me.core.property.get(window.var.search, "ui.basic.text");
        search = me.cleanSearchText(search);
        me.core.property.set(window.var.search, "ui.basic.text", search);
        if (search === window.searchText) {
            return;
        }
        me.reset(object);
        window.searchText = search;
        clearTimeout(me.searchTimer);
        var records = null;
        if (search) {
            me.core.property.set(window.var.resultsContainer, "ui.basic.show", false);
            me.core.property.set(window.var.resultsSpinner, "ui.style.visibility", "visible");
            records = await me.db.library.find(0, search);
            me.core.property.set(window.var.resultsSpinner, "ui.style.visibility", "hidden");
        }
        me.updateResults(object, records);
    };
    me.updateText = function (object) {
        var window = me.widget.window(object);
        var records = me.parseRecordsFromText(window);
        me.updateTextFromRecords(object, records);
    };
    me.removeExtra = function (json) {
        json = Object.assign({}, json);
        delete json._id
        delete json.id
        delete json.user
        return json;
    };
    me.addExtra = function (json, record) {
        json = Object.assign({}, json);
        delete json.id
        json._id = record.id || record._id;
        json.user = record.user || 0;
        return json;
    };
    me.updateTextFromRecords = function (object, records) {
        var window = me.widget.window(object);
        if(!Array.isArray(records)) {
            records = me.toRecordArray(records);
        }
        var structuredMode = window.options.structuredMode;
        var text = "";
        if (structuredMode) {
            text = JSON.stringify(records, null, 4);
        }
        else {
            var tags = {};
            for (var item of records) {
                if (text) {
                    text += "\n";
                }
                if (item.id) {
                    text += "#id:" + item.id;
                }
                else if(item._id) {
                    text += "#id:" + item._id;
                }
                else if(item.tags && item.tags._id) {
                    text += "#id:" + item.tags._id;
                }
                else {
                    text += "#id:";
                }
                var diff = [];
                if (item.tags) {
                    for (var tag in item.tags) {
                        if (tag in tags && tags[tag] === item.tags[tag]) {
                            continue;
                        }
                        if(tag === "id" || tag === "_id") {
                            continue;
                        }
                        if (text) {
                            text += "\n";
                        }
                        text += "#" + tag + ":" + item.tags[tag]
                        tags[tag] = item.tags[tag]
                    }
                    diff = Object.keys(tags).filter((i) => Object.keys(item.tags).indexOf(i) < 0);
                }
                else {
                    diff = Object.keys(tags);
                    tags = {};
                }
                for (var tag of diff) {
                    if (text) {
                        text += "\n";
                    }
                    text += "#" + tag + ":"
                }
                if (item.content && item.content.text) {
                    if (text) {
                        text += "\n";
                    }
                    text += item.content.text;
                }
            }
        }
        var transformText = "";
        for(var record of records) {
            if(transformText) {
                transformText += "<article>";
            }
            if(record.tags) {
                var getTag = (tag, prefix="") => { if(tag in record.tags) { return prefix + record.tags[tag] + "\n"} else {return ""}};
                transformText += getTag("article");
                transformText += getTag("title");
                transformText += getTag("chapter", "Chapter ");
                transformText += getTag("part", "Part ");
                transformText += getTag("volume");
                transformText += getTag("book");
                transformText += getTag("author");
            }
            transformText += record.content.text;
        };
        if (records.content) {
            transformText = records.content.map(record => record.text).join("<article>");
        }
        me.core.property.set(window.var.editor, "text", text);
        me.core.property.set(window.var.transform, "text", transformText);
        if (!window.options.editMode) {
            me.core.property.set(window.var.transform, "transform");
        }
    };
    me.parseRecordsFromText = function (object) {
        var window = me.widget.window(object);
        var text = me.core.property.get(window.var.editor, "text");
        var records = {};
        var array = [];
        if (text) {
            if (text[0] === "[") {
                array = JSON.parse(text);
            }
            else {
                var tags = {};
                for (line of text.split("\n")) {
                    var last = array[array.length - 1];
                    if (line[0] === "#") {
                        var [key, value] = line.substring(1).split(":").map(string => string.trim());
                        if (key === "id") {
                            if (last) {
                                last.tags = Object.assign({}, tags);
                            }
                            array.push({ id: value });
                        }
                        else {
                            if (!last) {
                                array.push({});
                                last = array[array.length - 1];
                            }
                            if (value) {
                                tags[key] = value;
                            }
                            else {
                                delete tags[key]
                            }
                        }
                    }
                    else {
                        if (!last) {
                            array.push({});
                            last = array[array.length - 1];
                        }
                        if (last.content && last.content.text) {
                            last.content.text += "\n" + line;
                        }
                        else {
                            last.content = { text: line };
                        }
                    }
                }
                if (last) {
                    last.tags = Object.assign({}, tags);
                }
            }
            records = me.fromRecordArray(array);
        }
        return records;
    };
    me.toRecordArray = function (json) {
        var array = [];
        if (json.content) {
            for (var index = 0; index < json.content.length; index++) {
                var id = 0;
                var tags = json.tags[index];
                var content = json.content[index];
                if(json.ids) {
                    id = json.ids[index];
                }
                else {
                    id = content._id || content.id;
                }
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
    me.process = function(object) {
        var window = me.widget.window(object);
        var text = me.core.property.get(window.var.editor, "text");
        var prevLine = "";
        text = text.split("\n").map(line => {
            if(line.startsWith("#")) {
                return line;
            }
            if(line.match(/[^.?!:;,\\\"'”…\\)’]$/)) {
                if(line.startsWith("Items")) {
                    return "";
                }
                if(prevLine.includes("article")) {
                    line = "#title:" + line;
                }
                else {
                    line = "#id:\n#article:" + line;
                }
            }
            prevLine = line;
            return line;
        }).join("\n");
        me.core.property.set(window.var.editor, "text", text);
        me.updateText(object);
    };
    me.gotoArticle = async function(object, tags) {
        var window = me.widget.window(object);
        me.core.property.set(window.var.resultsContainer, "ui.basic.show", false);
        me.core.property.set(window.var.resultsSpinner, "ui.style.visibility", "visible");
        var content = await me.db.library.content.get(tags._id);
        me.core.property.set(window.var.resultsSpinner, "ui.style.visibility", "hidden");
        var records = [{content:content,tags:tags}];
        me.updateTextFromRecords(window, records);
        window.showResults = false;
        me.updateMode(window);
    };
    me.showResults = function(object) {
        var window = me.widget.window(object);
        window.showResults = true;
        me.updateMode(window);
    };
    me.exportMenuList = function(object) {
        var window = me.widget.window(object);
        var tasks = me.core.app.tasks();
        var items = tasks.filter(task => {
            return me.core.property.get(task.window, "import");
        }).map(task => {
            return [
                task.label,
                () => {
                    var text = me.core.property.get(window.var.transform, "text");
                    me.core.property.set(task.window, "import", text);
                }
            ];
        });
        if(!items.length) {
            items = [[
                "No Open Compatible Applications",
                null,
                {
                    enabled:false
                }
            ]]
        }
        return items;
    };
    me.updateResults = function(object, results) {
        var window = me.widget.window(object);
        window.showResults = true;
        me.updateMode(window);
        var noSearch = false;
        if(!results) {
            results = [];
            noSearch = true;
        }
        var gotoArticle = function(info) {
            me.gotoArticle(object, info.item);
        };
        var fields = Object.keys(Object.assign({}, ...results)).filter(name => name !== 'user' && name !== '_id').map(name => {
            return { name: name, title: me.core.string.title(name), type: "text"};
        });
        $(window.var.resultsGrid).jsGrid("clearFilter");
        $(window.var.resultsGrid).jsGrid({
            width: "100%",
            height: "100%",

            inserting: false,
            filtering: true,
            clearFilterButton: true,
            noDataContent: noSearch ? "": "No Results Found",
            editing: false,
            sorting: true,
     
            fields: fields,
            autoload: true,
            rowClick: gotoArticle,
            controller: {
                data:results,
                loadData: function (filter) {
                    var filterCount = 0;
                    for(var key in filter) {
                        if(filter[key]) {
                            filterCount++;
                        }
                    }
                    if(!filterCount) {
                        return this.data;
                    }
                    return $.grep(this.data, function (item) {
                        var filterIndex = 0;
                        for(key in filter) {
                            var filterValue = filter[key];
                            var itemValue = item[key];
                            if(filterValue && itemValue) {
                                if(itemValue.toLowerCase().includes(filterValue.toLowerCase())) {
                                    filterIndex++;
                                }
                            }
                        }
                        return filterIndex === filterCount;
                    });
                },          
            }            
        });
    };
};
