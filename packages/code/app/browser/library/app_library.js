/*
 @author Zakai Hamilton
 @component AppLibrary
 */

screens.app.library = function AppLibrary(me, { core, ui, widget, db }) {
    me.init = async function () {
        core.property.link("widget.transform.clear", "app.library.clear", true);
        me.searchCounter = 0;
    };
    me.ready = function (methods) {
        methods["app.library.setTags"] = ["db.library.tagList"];
    };
    me.launch = function (args) {
        var search = args[0];
        var params = { search };
        if (core.property.get(me.singleton, "ui.node.parent")) {
            core.property.set(me.singleton, "widget.window.show", true);
            if (typeof search === "string") {
                core.property.set(me.singleton.var.search, "ui.basic.text", search);
                me.search(me.singleton);
            }
            return me.singleton;
        }
        me.singleton = ui.element.create(me.json, "workspace", "self", params);
    };
    me.refresh = async function (object) {
        var window = widget.window.get(object);
        me.tagList = await db.library.tagList();
        window.names = null;
    };
    me.setTags = function (tags) {
        me.tagList = tags;
    };
    me.initOptions = async function (object) {
        var window = widget.window.get(object);
        ui.options.load(me, window, {
            editMode: false,
            structuredMode: false,
            tagMode: false,
            combineResults: false
        });
        ui.options.toggleSet(me, null, {
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
        var window = widget.window.get(object);
        var showResults = window.showResults;
        var editMode = window.options.editMode && (!showResults || !window.searchText);
        var structuredMode = window.options.structuredMode;
        var tagMode = window.options.tagMode;
        core.property.set(window.var.transform, "ui.style.opacity", showResults || editMode ? "0" : "");
        core.property.set([window.var.editor, window.var.editorContainer, window.var.delete, window.var.update], "ui.basic.show", editMode);
        core.property.set(window.var.process, "ui.basic.show", !structuredMode && !tagMode && editMode);
        core.property.set(window.var.showResults, "ui.basic.show", !showResults);
        core.property.set(window.var.resultsContainer, "ui.basic.show", true);
        core.property.set(window.var.resultsContainer, "ui.style.display", showResults && window.searchText ? "" : "none");
    };
    me.cleanSearchText = function (search) {
        search = search.replace(/\s+/g, " ");
        return search;
    };
    me.insertTag = function (object, nameKey, nameValue) {
        var window = widget.window.get(object);
        var search = core.property.get(window.var.search, "ui.basic.text");
        var insert = true;
        if (search) {
            nameKey = nameKey.trim().toLowerCase();
            search = core.string.split(search).map((item) => {
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
            let name = nameKey + ":" + nameValue;
            if (name.includes(" ")) {
                search += "\"";
            }
            search += name;
            if (name.includes(" ")) {
                search += "\"";
            }
        }
        core.property.set(window.var.search, "ui.basic.text", search);
        me.changedSearch(window.var.search);
    };
    me.tagMenuList = {
        get: function (object) {
            let tagList = me.tagList;
            let menuItems = [];
            var keys = new Set();
            var keyValues = {};
            for (let item of tagList) {
                for (var key in item) {
                    if (key === "_id" || key === "user") {
                        continue;
                    }
                    keys.add(key);
                    let values = keyValues[key];
                    if (!values) {
                        values = keyValues[key] = new Set();
                    }
                    let value = item[key];
                    value = value.replace(/^\d+/g, (x) => core.string.padNumber(x, 3));
                    values.add(value);
                }
            }
            let isFirst = true;
            keys = Array.from(keys).sort();
            for (let key of keys) {
                let values = Array.from(keyValues[key]);
                var subItems = null;
                if (values.length > 100) {
                    let letters = {};
                    values = values.sort();
                    for (let value of values) {
                        let letter = value.trim().replace(/\W/g, "")[0].toUpperCase();
                        if (letter >= "0" && letter <= "9") {
                            letter = "#";
                        }
                        if (!letters[letter]) {
                            letters[letter] = [];
                        }
                        letters[letter].push(value);
                    }
                    subItems = [];
                    for (let letter in letters) {
                        subItems.push({
                            ref: letter,
                            text: letter,
                            select: letters[letter].map(value => {
                                return {
                                    ref: value,
                                    text: core.string.title(value),
                                    select: () => {
                                        me.insertTag(object, key, value);
                                    },
                                    properties: {
                                        group: "tagList"
                                    }
                                };
                            }),
                            properties: {
                                group: "tagList"
                            }
                        });
                    }
                }
                else {
                    subItems = values.sort().map(value => {
                        return {
                            ref: value,
                            text: core.string.title(value),
                            select: () => {
                                me.insertTag(object, key, value);
                            },
                            properties: {
                                group: "tagList"
                            }
                        };
                    });
                }
                menuItems.push({
                    key,
                    text: core.string.title(key),
                    select: subItems,
                    options: {
                        separator: isFirst
                    },
                    properties: {
                        group: "tagList"
                    }
                });
                isFirst = false;
            }
            return menuItems;
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
        var window = widget.window.get(object);
        core.property.set(window.var.search, "ui.basic.text", "");
        me.reset(object);
    };
    me.reset = function (object) {
        var window = widget.window.get(object);
        core.property.set(window.var.editor, "text", "");
        core.property.set(window.var.transform, "text", "");
        core.property.set(window.var.transform, "transform");
        core.property.set(window.var.resultsContainer, "ui.style.display", "none");
        core.property.set(window.var.resultsSpinner, "ui.style.visibility", "hidden");
        window.searchText = "";
    };
    me.reSearch = function (object) {
        var window = widget.window.get(object);
        window.searchText = "";
        me.search(object);
    };
    me.search = async function (object) {
        var window = widget.window.get(object);
        var tagMode = window.options.tagMode;
        var search = core.property.get(window.var.search, "ui.basic.text");
        search = me.cleanSearchText(search);
        core.property.set(window.var.search, "ui.basic.text", search);
        if (search === window.searchText) {
            return;
        }
        var counter = ++me.searchCounter;
        me.reset(object);
        window.searchText = search;
        clearTimeout(me.searchTimer);
        var records = null;
        if (search) {
            core.property.set(window.var.resultsContainer, "ui.style.display", "none");
            core.property.set(window.var.resultsSpinner, "text", "Loading");
            core.property.set(window.var.resultsSpinner, "ui.style.visibility", "visible");
            try {
                records = await db.library.find(search);
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
            core.property.set(window.var.resultsSpinner, "ui.style.visibility", "hidden");
        }
    };
    me.updateText = function (object) {
        var window = widget.window.get(object);
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
        var window = widget.window.get(object);
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
                var getTag = (tag, prefix = "", suffix = "\n") => { if (tag in record.tags) { return prefix + record.tags[tag] + suffix; } else { return ""; } };
                transformText += getTag("title");
                transformText += getTag("number", "", ": ");
                transformText += getTag("article");
                transformText += getTag("chapter", "Chapter: ");
                transformText += getTag("section");
                transformText += getTag("part", "Part: ");
                transformText += getTag("portion");
                transformText += getTag("year");
                transformText += getTag("volume");
                transformText += getTag("book");
                transformText += getTag("author");
            }
            transformText += record.content.text;
        }
        core.property.set(window.var.editor, "text", text);
        core.property.set(window.var.transform, "text", transformText);
        if (!window.options.editMode) {
            core.property.set(window.var.transform, "transform");
        }
    };
    me.parseRecordsFromText = function (object) {
        var window = widget.window.get(object);
        var text = core.property.get(window.var.editor, "text");
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
        var window = widget.window.get(object);
        var tagMode = window.options.tagMode;
        var records = me.parseRecordsFromText(window);
        if (records.content && !tagMode) {
            records.content = await db.library.content.store(records.content);
            records.ids = records.content.map(item => item._id);
        }
        if (records.tags) {
            for (var index = 0; index < records.tags.length; index++) {
                records.tags[index] = me.addExtra(records.tags[index], records.content[index]);
            }
            records.tags = await db.library.tags.store(records.tags);
            records.ids = records.tags.map(item => item._id);
        }
        me.updateTextFromRecords(window, records);
        me.refresh(window);
    };
    me.deleteRecord = async function (object) {
        var records = me.parseRecordsFromText(object);
        if (records.ids && records.ids.length) {
            await db.library.tags.remove({ _id: records.ids[0] });
            await db.library.content.remove({ _id: records.ids[0] });
        }
    };
    me.process = function (object) {
        var window = widget.window.get(object);
        var text = core.property.get(window.var.editor, "text");
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
        core.property.set(window.var.editor, "text", text);
        me.updateText(object);
    };
    me.gotoArticle = async function (object, tags, spinner = true) {
        var window = widget.window.get(object);
        core.property.set(window.var.resultsContainer, "ui.style.display", "none");
        if (spinner) {
            core.property.set(window.var.resultsSpinner, "ui.style.visibility", "visible");
        }
        if (!Array.isArray(tags)) {
            var content = await db.library.findContentById(tags._id);
        }
        var records = [];
        if (Array.isArray(tags)) {
            records = tags.map(async (record, index) => {
                if (window.options.combineResults) {
                    var content = await db.library.findContentById(record._id);
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
            core.property.set(window.var.resultsSpinner, "ui.style.visibility", "hidden");
        }
    };
    me.showResults = function (object) {
        var window = widget.window.get(object);
        window.showResults = true;
        me.updateMode(window);
    };
    me.exportText = function (object, target) {
        var window = widget.window.get(object);
        var text = core.property.get(window.var.transform, "text");
        core.property.set(target, "importData", text);
    };
    me.updateResults = function (object, results) {
        var window = widget.window.get(object);
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
        var fields = Object.keys(Object.assign({}, ...results)).filter(name => name !== "user" && name !== "_id").map(name => {
            return { name: name, title: core.string.title(name), type: "text" };
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
                ui.theme.updateElements(window.var.resultsGrid);
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
        var window = widget.window.get(object);
        var search = core.property.get(window.var.search, "ui.basic.text");
        core.util.copyUrl("library", [search]);
    };
    me.content = {
        search: async function (text) {
            var tagList = me.tagList;
            if (!tagList) {
                tagList = me.tagList = await db.library.tagList();
            }
            else if (tagList.then) {
                tagList = me.tagList = await tagList;
            }
            var tags = {};
            for (let item of tagList) {
                for (let key in item) {
                    if (key === "_id" || key === "user") {
                        continue;
                    }
                    var value = item[key];
                    value = value.replace(/\d+/g, (x) => core.string.padNumber(x, 3));
                    if (key.toLowerCase().includes(text) || value.toLowerCase().includes(text)) {
                        if (!tags[key]) {
                            tags[key] = new Set();
                        }
                        tags[key].add(value);
                    }
                }
            }
            let collections = [];
            for (let key in tags) {
                let members = Array.from(tags[key]).map(title => {
                    let search = key + ":" + title;
                    if (search.includes(" ")) {
                        search = "\"" + search + "\"";
                    }
                    let args = ["core.app.launch", "library", search];
                    return { title: core.string.title(title), args };
                });
                members = members.sort((a, b) => a.title.localeCompare(b.title));
                collections.push({ title: core.string.title(key), members });
            }
            return collections;
        }
    };
};
