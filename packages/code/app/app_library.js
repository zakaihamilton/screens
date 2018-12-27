/*
 @author Zakai Hamilton
 @component AppLibrary
 */

screens.app.library = function AppLibrary(me) {
    me.launch = function (args) {
        var params = { search: args[0] };
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element.create(__json__, "workspace", "self", params);
    };
    me.init = async function () {
        var promises = [];
        promises.push(me.import("external/jsgrid-1.5.3/jsgrid.min.css"));
        promises.push(me.import("external/jsgrid-1.5.3/jsgrid-theme.min.css"));
        promises.push(me.import("node_modules/jquery/dist/jquery.min.js"));
        await Promise.all(promises);
        await me.core.require.load("/external/jsgrid-1.5.3/jsgrid.min.js");
        me.tagList = me.core.message.send_server("core.cache.use",
            me.id,
            "db.library.tags.list");
        me.core.property.link("widget.transform.clear", "app.library.clear", true);
        me.searchCounter = 0;
    };
    me.refresh = async function () {
        me.core.message.send_server("core.cache.reset", me.id);
        me.tagList = me.core.message.send_server("core.cache.use",
            me.id,
            "db.library.tags.list");
    };
    me.initOptions = async function (object) {
        var window = me.widget.window.get(object);
        me.ui.options.load(me, window, {
            editMode: false,
            structuredMode: false,
            tagMode: false,
            combineResults: false
        });
        me.ui.options.toggleSet(me, null, {
            "editMode": me.updateEditMode,
            "structuredMode": me.updateEditMode,
            "tagMode": me.reSearch,
            "combineResults": me.reSearch
        });
        window.showResults = true;
        me.updateMode(window);
        me.reset(window);
        me.search(window);
    };
    me.updateEditMode = function (object) {
        me.updateMode(object);
        me.updateText(object);
    };
    me.updateMode = function (object) {
        var window = me.widget.window.get(object);
        var showResults = window.showResults;
        var editMode = window.options.editMode && (!showResults || !window.searchText);
        var structuredMode = window.options.structuredMode;
        var tagMode = window.options.tagMode;
        me.core.property.set(window.var.transform, "ui.style.opacity", showResults || editMode ? "0" : "");
        me.core.property.set([window.var.editor, window.var.editorContainer, window.var.delete, window.var.update], "ui.basic.show", editMode);
        me.core.property.set(window.var.process, "ui.basic.show", !structuredMode && !tagMode && editMode);
        me.core.property.set(window.var.showResults, "ui.basic.show", !showResults);
        me.core.property.set(window.var.resultsContainer, "ui.basic.show", true);
        me.core.property.set(window.var.resultsContainer, "ui.style.display", showResults && window.searchText ? "" : "none");
    };
    me.cleanSearchText = function (search) {
        search = search.replace(/\s+/g, " ");
        return search;
    };
    me.menuList = function (object, list, group) {
        var window = me.widget.window.get(object);
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
                    var value = item[key];
                    if (value.match(/^\d/)) {
                        value = me.core.string.padNumber(value, 3);
                    }
                    names.add(key + ":" + value);
                }
            }
            names = Array.from(names).sort().map((name) => {
                var [nameKey, nameValue] = name.split(":");
                var result = [
                    nameValue,
                    async function () {
                        var search = me.core.property.get(window.var.search, "ui.basic.text");
                        var insert = true;
                        if (search) {
                            nameKey = nameKey.trim().toLowerCase();
                            search = me.core.string.split(search).map((item) => {
                                if (item.includes(":")) {
                                    var [itemKey] = item.split(":");
                                    itemKey = itemKey.trim().toLowerCase();
                                    if (itemKey === nameKey) {
                                        insert = false;
                                        item = nameKey + ":" + nameValue;
                                    }
                                }
                                if (item.includes(" ")) {
                                    item = "\"" + item + "\"";
                                }
                                return item;
                            }).join(" ");
                            search = me.cleanSearchText(search);
                            if (search && insert) {
                                search += " ";
                            }
                        }
                        if (insert) {
                            if (name.includes(" ")) {
                                search += "\"";
                            }
                            search += name;
                            if (name.includes(" ")) {
                                search += "\"";
                            }
                        }
                        me.core.property.set(window.var.search, "ui.basic.text", search);
                        me.changedSearch(window.var.search);
                    },
                    {
                        "unique": false
                    },
                    {
                        "group": group,
                        "prefix": nameKey
                    }
                ];
                return result;
            });
            return names;
        };
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
        return parseItems(list);
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
        var window = me.widget.window.get(object);
        me.core.property.set(window.var.search, "ui.basic.text", "");
        me.reset(object);
    };
    me.reset = function (object) {
        var window = me.widget.window.get(object);
        me.core.property.set(window.var.editor, "text", "");
        me.core.property.set(window.var.transform, "text", "");
        me.core.property.set(window.var.transform, "transform");
        window.searchText = "";
    };
    me.reSearch = function (object) {
        var window = me.widget.window.get(object);
        window.searchText = "";
        me.search(object);
    };
    me.search = async function (object) {
        var window = me.widget.window.get(object);
        var tagMode = window.options.tagMode;
        var search = me.core.property.get(window.var.search, "ui.basic.text");
        search = me.cleanSearchText(search);
        me.core.property.set(window.var.search, "ui.basic.text", search);
        if (search === window.searchText) {
            return;
        }
        var counter = ++me.searchCounter;
        me.reset(object);
        window.searchText = search;
        clearTimeout(me.searchTimer);
        var records = null;
        if (search) {
            me.core.property.set(window.var.resultsContainer, "ui.style.display", "none");
            me.core.property.set(window.var.resultsSpinner, "text", "Loading");
            me.core.property.set(window.var.resultsSpinner, "ui.style.visibility", "visible");
            try {
                records = await me.db.library.find(search);
            }
            catch (err) {
                me.log_error("Failed to search for: " + search + " err: " + JSON.stringify(err));
            }
            if (counter !== me.searchCounter) {
                me.log("counter: " + counter + " does not match: " + me.searchCounter);
                return;
            }
        }
        me.updateResults(object, records);
        if (records) {
            if (records.length === 1) {
                await me.gotoArticle(object, records[0], false);
            }
            else if (tagMode || window.options.combineResults) {
                await me.gotoArticle(object, records, false);
            }
        }
        if (search) {
            me.core.property.set(window.var.resultsSpinner, "ui.style.visibility", "hidden");
        }
    };
    me.updateText = function (object) {
        var window = me.widget.window.get(object);
        var records = me.parseRecordsFromText(window);
        me.updateTextFromRecords(object, records);
    };
    me.removeExtra = function (json) {
        json = Object.assign({}, json);
        delete json._id;
        delete json.id;
        return json;
    };
    me.addExtra = function (json, record) {
        json = Object.assign({}, json);
        delete json.id;
        json._id = record.id || record._id;
        return json;
    };
    me.updateTextFromRecords = function (object, records) {
        var window = me.widget.window.get(object);
        if (!Array.isArray(records)) {
            records = me.toRecordArray(records);
        }
        var structuredMode = window.options.structuredMode;
        var tagMode = window.options.tagMode;
        var text = "";
        if (tagMode) {
            records = records.map(item => {
                item = Object.assign({}, item);
                delete item.content;
                return item;
            });
        }
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
                else if (item._id) {
                    text += "#id:" + item._id;
                }
                else if (item.tags && item.tags._id) {
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
                        if (tag === "id" || tag === "_id") {
                            continue;
                        }
                        if (text) {
                            text += "\n";
                        }
                        text += "#" + tag + ":" + item.tags[tag];
                        tags[tag] = item.tags[tag];
                    }
                    diff = Object.keys(tags).filter((i) => Object.keys(item.tags).indexOf(i) < 0);
                }
                else {
                    diff = Object.keys(tags);
                    tags = {};
                }
                for (let tag of diff) {
                    if (text) {
                        text += "\n";
                    }
                    text += "#" + tag + ":";
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
        for (var record of records) {
            if (!record.content) {
                continue;
            }
            if (transformText) {
                transformText += "<article>";
            }
            if (record.tags) {
                var getTag = (tag, prefix = "") => { if (tag in record.tags) { return prefix + record.tags[tag] + "\n"; } else { return ""; } };
                transformText += getTag("title");
                transformText += getTag("article");
                transformText += getTag("chapter", "Chapter: ");
                transformText += getTag("section");
                transformText += getTag("part", "Part: ");
                transformText += getTag("portion");
                transformText += getTag("volume");
                transformText += getTag("book");
                transformText += getTag("author");
            }
            transformText += record.content.text;
        }
        me.core.property.set(window.var.editor, "text", text);
        me.core.property.set(window.var.transform, "text", transformText);
        if (!window.options.editMode) {
            me.core.property.set(window.var.transform, "transform");
        }
    };
    me.parseRecordsFromText = function (object) {
        var window = me.widget.window.get(object);
        var text = me.core.property.get(window.var.editor, "text");
        var records = {};
        var array = [];
        var isTag = false;
        var line = null;
        if (text) {
            if (text[0] === "[") {
                array = JSON.parse(text);
            }
            else {
                var tags = {};
                for (line of text.split("\n")) {
                    var last = array[array.length - 1];
                    if (line[0] === "#") {
                        if (!isTag && !line.startsWith("#id:")) {
                            if (last) {
                                last.tags = Object.assign({}, tags);
                            }
                            array.push({ id: "" });
                            last = array[array.length - 1];
                        }
                        isTag = true;
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
                                delete tags[key];
                            }
                        }
                    }
                    else if (line.trim() !== "") {
                        isTag = false;
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
                if (json.ids) {
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
        for (var record of array) {
            dict.tags.push(me.addExtra(record.tags, record));
            dict.content.push(me.addExtra(record.content, record));
            dict.ids.push(record.id);
        }
        return dict;
    };
    me.updateRecord = async function (object) {
        var window = me.widget.window.get(object);
        var tagMode = window.options.tagMode;
        var records = me.parseRecordsFromText(window);
        if (records.content && !tagMode) {
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
        me.updateTextFromRecords(window, records);
        me.refresh();
    };
    me.deleteRecord = async function (object) {
        var records = me.parseRecordsFromText(object);
        if (records.ids) {
            await me.db.library.tags.remove(records.ids);
            await me.db.library.content.remove(records.ids);
        }
    };
    me.process = function (object) {
        var window = me.widget.window.get(object);
        var text = me.core.property.get(window.var.editor, "text");
        var prevLine = "";
        var isTag = false;
        text = text.split("\n").map(line => {
            var isTagged = false;
            line = line.trim();
            if (line.startsWith("#")) {
                isTagged = true;
                if (!isTag && !line.startsWith("#id:")) {
                    line = "#id:\n" + line;
                }
                isTag = true;
                return line;
            }
            else {
                isTag = false;
            }
            if (!isTagged && line.match(/[^.?!:;,"\\'”…\\)’]$/)) {
                if (line.startsWith("Items")) {
                    return "";
                }
                if (line.startsWith("Chapter")) {
                    line = line.replace("Chapter ", "#id:\n#chapter:");
                }
                else if (prevLine.includes("article")) {
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
    me.gotoArticle = async function (object, tags, spinner = true) {
        var window = me.widget.window.get(object);
        me.core.property.set(window.var.resultsContainer, "ui.style.display", "none");
        if (spinner) {
            me.core.property.set(window.var.resultsSpinner, "ui.style.visibility", "visible");
        }
        if (!Array.isArray(tags)) {
            var content = await me.db.library.content.get(tags._id);
        }
        var records = [];
        if (Array.isArray(tags)) {
            records = tags.map(async (record, index) => {
                if (window.options.combineResults) {
                    var content = await me.db.library.content.get(record._id);
                    if (index !== tags.length - 1) {
                        content.text += "\n<br>\n";
                    }
                    return { content: content, tags: record };
                }
                else {
                    return { tags: record };
                }
            });
            records = await Promise.all(records);
        }
        else {
            records = [{ content: content, tags: tags }];
        }
        me.updateTextFromRecords(window, records);
        window.showResults = false;
        me.updateMode(window);
        if (spinner) {
            me.core.property.set(window.var.resultsSpinner, "ui.style.visibility", "hidden");
        }
    };
    me.showResults = function (object) {
        var window = me.widget.window.get(object);
        window.showResults = true;
        me.updateMode(window);
    };
    me.exportText = function (object, target) {
        var window = me.widget.window.get(object);
        var text = me.core.property.get(window.var.transform, "text");
        me.core.property.set(target, "importData", text);
    };
    me.updateResults = function (object, results) {
        var window = me.widget.window.get(object);
        window.showResults = true;
        me.updateMode(window);
        var noSearch = false;
        if (!results) {
            results = [];
            noSearch = true;
        }
        var gotoArticle = function (info) {
            setTimeout(() => {
                me.gotoArticle(object, info.item);
            }, 250);
        };
        var fields = Object.keys(Object.assign({}, ...results)).filter(name => name !== 'user' && name !== '_id').map(name => {
            return { name: name, title: me.core.string.title(name), type: "text" };
        });
        $(window.var.resultsGrid).jsGrid("clearFilter");
        $(window.var.resultsGrid).jsGrid({
            width: "100%",
            height: "100%",

            inserting: false,
            filtering: true,
            clearFilterButton: true,
            noDataContent: noSearch ? "" : "No Results Found",
            editing: false,
            sorting: true,

            fields: fields,
            autoload: true,
            rowClick: gotoArticle,
            onRefreshed: () => {
                me.ui.theme.updateElements(window.var.resultsGrid);
            },
            controller: {
                data: results,
                loadData: function (filter) {
                    var filterCount = 0;
                    for (var key in filter) {
                        if (filter[key]) {
                            filterCount++;
                        }
                    }
                    if (!filterCount) {
                        return this.data;
                    }
                    return $.grep(this.data, function (item) {
                        var filterIndex = 0;
                        for (key in filter) {
                            var filterValue = filter[key];
                            var itemValue = item[key];
                            if (filterValue && itemValue) {
                                if (itemValue.toLowerCase().includes(filterValue.toLowerCase())) {
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
    me.copyUrl = function (object) {
        var window = me.widget.window.get(object);
        var search = me.core.property.get(window.var.search, "ui.basic.text");
        me.core.util.copyUrl("library", [search]);
    };
};
