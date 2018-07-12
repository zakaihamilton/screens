/*
 @author Zakai Hamilton
 @component DbLibrary
 */

screens.db.library = function DbLibrary(me) {
    me.find = async function (userId, query) {
        var tags = me.db.library.query.tags(query);
        var filter = me.db.library.query.filter(query);
        var params = {};
        var result = {};
        var doQuery = false;
        if (filter) {
            if(filter !== "*") {
                params["$text"] = { "$search": filter };
            }
            doQuery = true;
        }
        me.log("query: " + query + " userId: " + userId + " tags: " + JSON.stringify(tags) + " filter: " + filter);
        if (tags && Object.keys(tags).length) {
            var tagList = await me.db.library.tags.list(userId, tags);
            me.log("found " + tagList.length + " matching tags");
            if (tagList.length) {
                if(tagList.length > 1) {
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
            if(filter === "*") {
                result = await me.db.library.tags.list(userId, params, {});
            }
            else {
                list = await me.db.library.content.list(userId, params, {});
                result = await me.db.library.tags.findByIds(list.map(item => item._id));
            }
            me.log("number of results: " + result.length);
        }
        return result;
    };
    return "server";
};

screens.db.library.tags = function DbLibraryTag(me) {
    me.init = me.storage.db.helper.extend;
};

screens.db.library.content = function DbLibraryContent(me) {
    me.init = me.storage.db.helper.extend;
};

screens.db.library.query = function DbLibraryQuery(me) {
    me.tags = function (query) {
        me.log("Retrieving tags for query: " + query);
        var tags = {};
        var tokens = me.core.string.split(query).sort();
        for (var token of tokens) {
            if (token.includes(":")) {
                var [key, value] = token.split(":");
                var regex = new RegExp(["^", me.core.string.escape(value.trim()), "$"].join(""), "i");
                tags[key.trim().toLowerCase()] = regex;
            }
        }
        return tags;
    };
    me.filter = function (query) {
        me.log("Retrieving filter for query: " + query);
        var filter = "";
        try {
            query = query.replace(/'/g, "\\'");
            var tokens = me.storage.db.split(query, {keepQuotes: true, separator:' '});
        }
        catch(err) {
            me.error(err);
        }
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
};
