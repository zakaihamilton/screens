/*
 @author Zakai Hamilton
 @component DbLibrary
 */

screens.db.library = function DbLibrary(me) {
    me.findContentById = function (id) {
        return me.content.findById(id);
    };
    me.tagList = function () {
        return me.tags.list();
    };
    me.find = async function (query, tagList) {
        if (!tagList) {
            tagList = [];
        }
        var segments = query.split(" AND ");
        if (segments && segments.length > 1) {
            me.log("AND: " + JSON.stringify(segments));
            for (let segment of segments) {
                tagList = await me.find(segment, tagList);
            }
            me.log("returning " + tagList.length + " unique results");
            return tagList;
        }
        segments = query.split(" OR ");
        if (segments && segments.length > 1) {
            me.log("OR: " + JSON.stringify(segments));
            var results = [];
            for (let segment of segments) {
                results.push(... await me.find(segment, tagList));
            }
            var prevLength = results.length;
            results = me.core.json.union(results, "_id");
            me.log("returning " + results.length + " results (reduced from " + prevLength + " )");
            return results;
        }
        var tags = me.db.library.query.tags(query);
        var filter = me.db.library.query.filter(query);
        var params = {};
        var result = [];
        var doQuery = false;
        if (filter) {
            if (filter !== "*") {
                params["$text"] = { "$search": filter };
            }
            doQuery = true;
        }
        me.log("query: " + query + " tags: " + JSON.stringify(tags) + " filter: " + filter);
        if (tags && Object.keys(tags).length) {
            tagList.push(...await me.db.library.tags.list(tags));
        }
        if (tagList.length) {
            me.log("found " + tagList.length + " matching tags");
            if (tagList.length) {
                if (tagList.length > 1) {
                    params["_id"] = { $in: tagList.map(item => item._id) };
                }
                else {
                    params["_id"] = tagList[0]._id;
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
                result = await me.db.library.tags.list(params, {});
            }
            else {
                list = await me.db.library.content.list(params, {});
                result = await me.db.library.tags.findByIds(list.map(item => item._id));
            }
            me.log("number of results: " + result.length);
        }
        return result;
    };
    return "server";
};

screens.db.library.tags = function DbLibraryTag(me) {
    me.init = () => me.storage.db.extension(me);
    return "server";
};

screens.db.library.content = function DbLibraryContent(me) {
    me.init = () => me.storage.db.extension(me);
    return "server";
};

screens.db.library.query = function DbLibraryQuery(me) {
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
                    var regex = new RegExp(["^", me.core.string.escape(value.trim()), "$"].join(""), "i");
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
