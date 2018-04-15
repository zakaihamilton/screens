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
        child.insert = async function (userId, data) {
            return await me.insert(userId, child.id, data, child.index);
        };
        child.remove = async function (objectId) {
            return await me.remove(objectId, child.id);
        };
        child.get = async function (objectId) {
            return await me.get(objectId, child.id);
        };
        child.update = async function (objectId, data) {
            return await me.update(objectId, child.id, data);
        };
        child.list = async function (userId, params) {
            return await me.list(userId, child.id, params);
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
    me.insert = async function (userId, name, data, index) {
        data = Object.assign({ user: userId || 0 }, data);
        var location = me.location(name || this.id);
        if(index) {
            await me.storage.db.createIndex(location, index);
        }
        var object = await me.storage.db.insertOne(location, data);
        return object;
    };
    me.remove = async function (objectId, name) {
        var object = await me.storage.db.remove(me.location(name || this.id), objectId);
        return object;
    };
    me.get = async function (objectId, name) {
        var object = await me.storage.db.findOne(me.location(name || this.id), objectId);
        return object;
    };
    me.update = async function (objectId, name, data) {
        var result = await me.storage.db.update(me.location(name || this.id), objectId, data);
        return result;
    };
    me.list = async function (userId, name, params) {
        params = Object.assign({}, params);
        params.user = userId || 0;
        var list = await me.storage.db.list(me.location(name || this.id), params);
        return list;
    };
    me.find = async function (userId, query) {
        me.log("query: " + query + " userId: " + userId);
        var tags = me.db.library.query.tags(query);
        var filter = me.db.library.query.filter(query);
        var params = {};
        var result = {};
        var doQuery = false;
        if (filter) {
            params["$text"] = { "$search": filter };
            doQuery = true;
        }
        if (tags && tags.length) {
            var tagList = await me.db.library.tag.list(userId, tags, {});
            if(tagList.length) {
                params["_id"] = { "$in" : tagList.map(item => item._id)};
                doQuery = true;
            }
            else {
                doQuery = false;
            }
            result.tags = tagList;
        }
        var list = [];
        if(doQuery) {
            me.log("params: " + JSON.stringify(params));
            list = await me.db.library.content.list(userId, params);
            result.content = list;
            if(!result.tags) {
                list = await me.db.library.content.list(userId, {_id:{"$in":result.ids}});
                result.tags = list;
            }
        }
        return result;
    };
    return "server";
};

screens.db.library.tag = function DbLibraryTag(me) {
    me.init = me.upper.extend;
};

screens.db.library.content = function DbLibraryContent(me) {
    me.init = me.upper.extend;
    me.index = {text:"text"};
};

screens.db.library.query = function DbLibraryQuery(me) {
    me.tags = function (query) {
        var tags = {};
        var tokens = query.split(" ");
        for (var token of tokens) {
            if (token.includes(":")) {
                var [key, value] = str.split(":");
                tags[key] = value;
            }
        }
        return tags;
    };
    me.filter = function (query) {
        var filter = "";
        var tokens = query.split(" ");
        for (var token of tokens) {
            if (!token.includes(":")) {
                if (filter) {
                    filter += " ";
                }
                filter += token;
            }
        }
        return filter;
    };
};
