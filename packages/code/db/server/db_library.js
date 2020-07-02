/*
 @author Zakai Hamilton
 @component DbLibrary
 */

screens.db.library = function DbLibrary(me, { core, storage, db }) {
    me.findContentById = function (id) {
        return me.content.findById(id);
    };
    me.tagList = function () {
        return me.tags.list();
    };
    me.compareTags = function (source, target) {
        source = Object.assign({}, source);
        target = Object.assign({}, target);
        delete source._id;
        delete target._id;
        return core.json.compare(source, target);
    };
    me.removeDuplicates = async function (text) {
        let duplicatesLength = 0;
        let results = await me.find(text);
        let tagsList = await me.tags.findByIds(results.map(item => item._id));
        let contentList = await me.content.findByIds(results.map(item => item._id));
        let ids = tagsList.map(item => item._id);
        let duplicates = [];
        for (let id of ids) {
            let tags = tagsList.find(item => item._id === id);
            let content = contentList.find(item => item._id === id);
            if (!content) {
                continue;
            }
            let duplicate = contentList.find(item => item._id !== id && item.text === content.text);
            if (duplicate) {
                let match = tagsList.find(item => item._id === duplicate._id);
                if (me.compareTags(tags, match)) {
                    duplicates.push(id);
                    duplicatesLength++;
                    contentList = contentList.filter(item => item._id !== duplicate._id);
                }
            }
        }
        for (let id of duplicates) {
            await me.tags.remove({ _id: id });
            await me.content.remove({ _id: id });
        }
        return duplicatesLength;
    };
    me.find = async function (text, tagList) {
        if (!tagList) {
            tagList = [];
        }
        var segments = text.split(" AND ");
        if (segments && segments.length > 1) {
            me.log("AND: " + JSON.stringify(segments));
            for (let segment of segments) {
                tagList = await me.find(segment, tagList);
            }
            me.log("returning " + tagList.length + " unique results");
            return tagList;
        }
        segments = text.split(" OR ");
        if (segments && segments.length > 1) {
            me.log("OR: " + JSON.stringify(segments));
            var results = [];
            for (let segment of segments) {
                results.push(... await me.find(segment, tagList));
            }
            var prevLength = results.length;
            results = core.json.union(results, "_id");
            me.log("returning " + results.length + " results (reduced from " + prevLength + " )");
            return results;
        }
        var tags = db.library.query.tags(text);
        var filter = db.library.query.filter(text);
        var query = {};
        var params = {};
        var result = [];
        var doQuery = false;
        if (filter) {
            if (filter !== "*") {
                query["$text"] = { "$search": filter };
                params.project = { score: { $meta: "textScore" } };
                params.sort = { score: { $meta: "textScore" } };
            }
            doQuery = true;
        }
        me.log("query: " + storage.db.queryAsString(query) + " tags: " + storage.db.queryAsString(tags) + " filter: " + filter);
        if (tags && Object.keys(tags).length) {
            tagList.push(...await db.library.tags.list(tags));
        }
        if (tagList.length) {
            me.log("found " + tagList.length + " matching tags");
            if (tagList.length) {
                if (tagList.length > 1) {
                    query["_id"] = { $in: tagList.map(item => item._id) };
                }
                else {
                    query["_id"] = tagList[0]._id;
                }
                doQuery = true;
            }
            else {
                doQuery = false;
            }
            result = tagList;
        }
        var list = [];
        if (doQuery) {
            if (filter === "*") {
                result = await db.library.tags.list(query, params);
            }
            else {
                list = await db.library.content.list(query, params);
                result = await db.library.tags.findByIds(list.map(item => item._id));
                if (result) {
                    result.sort((a, b) => {
                        let score_a = list.find(item => item._id === a._id).score;
                        let score_b = list.find(item => item._id === b._id).score;
                        return score_b - score_a;
                    });
                }
            }
            me.log("number of results: " + result.length);
        }
        return result;
    };
    return "server";
};

screens.db.library.tags = function DbLibraryTag(me, { storage }) {
    me.init = () => storage.db.extension(me);
    me.cache = true;
    return "server";
};

screens.db.library.content = function DbLibraryContent(me, { storage }) {
    me.init = () => storage.db.extension(me);
    return "server";
};

screens.db.library.query = function DbLibraryQuery(me, { core }) {
    me.tokens = function (query) {
        const regex = /(?:[^\s,"]|"(?:\\.|[^"])*")+/gm;
        let m;

        var tokens = [];
        while ((m = regex.exec(query)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            m.forEach(match => {
                tokens.push(match);
            });
        }
        return tokens;
    };
    me.tags = function (query) {
        me.log("Retrieving tags for query: " + query);
        var tags = {};
        var tokens = me.tokens(query);
        for (var token of tokens) {
            if (token.includes(":")) {
                token = token.replace(/"/gi, "");
                var [key, value] = token.split(":");
                key = key.trim().toLowerCase();
                if (value) {
                    var regex = new RegExp(["^", core.string.escape(value.trim()), "$"].join(""), "i");
                    tags[key] = regex;
                }
                else {
                    tags[key] = { "$exists": false };
                }
            }
        }
        return tags;
    };
    me.filter = function (query) {
        me.log("Retrieving filter for query: " + query);
        var filter = "";
        var tokens = me.tokens(query);
        me.log("tokens: " + JSON.stringify(tokens));
        for (var token of tokens) {
            if (!token.includes(":")) {
                if (filter) {
                    filter += " ";
                }
                filter += token.trim();
            }
        }
        return filter;
    };
    return "server";
};
