/*
 @author Zakai Hamilton
 @component DbLibrary
 */

screens.db.library = function DbLibrary(me) {
    me.defaultLocation = {
        db: "library",
        collection: "object"
    };
    me.extend = function (child) {
        child.remove = async function (objectId) {
            return await me.remove(objectId, child.id);
        };
        child.get = async function (objectId) {
            return await me.get(objectId, child.id);
        };
        child.set = async function (data) {
            return await me.set(child.id, data);
        };
        child.list = async function (userId, params, count) {
            return await me.list(userId, child.id, params, count);
        };
        child.findByIds = async function(ids) {
            return await me.findByIds(child.id, ids);
        };
    };
    me.location = function (name) {
        var location = me.defaultLocation;
        if (name) {
            name = name.split(".").pop();
            location = Object.assign({}, location, { collection: name });
        }
        return location;
    };
    me.remove = async function (objectId, name) {
        var object = await me.storage.db.remove(me.location(name || this.id), objectId);
        return object;
    };
    me.get = async function (objectId, name) {
        var object = await me.storage.db.findOne(me.location(name || this.id), objectId);
        return object;
    };
    me.set = async function (name, data) {
        var result = await me.storage.db.set(me.location(name || this.id), data);
        return result;
    };
    me.findByIds = async function(name, ids) {
        var result = await me.storage.db.findByIds(me.location(name || this.id), ids);
        return result;
    };
    me.list = async function (userId, name, params, count) {
        params = Object.assign({}, params);
        params.user = userId || 0;
        var list = await me.storage.db.list(me.location(name || this.id), params, count);
        return list;
    };
    me.find = async function (userId, query, count) {
        var tags = me.db.library.query.tags(query);
        var filter = me.db.library.query.filter(query);
        var params = {};
        var result = {};
        var doQuery = false;
        if (filter) {
            params["$text"] = { "$search": filter };
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
            me.log("params: " + JSON.stringify(params));
            list = await me.db.library.content.list(userId, params, count);
            result = await me.db.library.tags.findByIds(list.map(item => item._id));
            me.log("number of results: " + result.length);
        }
        return result;
    };
    return "server";
};

screens.db.library.tags = function DbLibraryTag(me) {
    me.init = me.upper.extend;
};

screens.db.library.content = function DbLibraryContent(me) {
    me.init = me.upper.extend;
    me.index = { text: "text" };
};

screens.db.library.query = function DbLibraryQuery(me) {
    me.tags = function (query) {
        var tags = {};
        var tokens = query.split(" AND ").sort();
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
        var filter = "";
        var tokens = query.split(" AND ").sort();
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
