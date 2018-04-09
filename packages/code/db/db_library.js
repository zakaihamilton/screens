/*
 @author Zakai Hamilton
 @component DbLibrary
 */

screens.db.library = function DbLibrary(me) {
    me.defaultLocation = {
        db:"library",
        collection:"object"
    };
    me.extend = function(child) {
        child.insert = async function(userId, data) {
            return await me.insert(userId, child.id, data);
        };
        child.remove = async function(objectId, data) {
            return await me.remove(objectId, child.id);
        };
        child.get = async function(objectId) {
            return await me.get(objectId, child.id);
        };
        child.set = async function(objectId, data) {
            return await me.set(objectId, child.id, data);
        };
        child.list = async function(userId) {
            return await me.list(userId, child.id);
        };
    };
    me.location = function(name) {
        var location = me.defaultLocation;
        if(name) {
            name = name.split(".").pop();
            location = Object.assign({}, location, {collection:name});
        }
        return location;
    };
    me.insert = async function(userId, name, data) {
        data = Object.assign({user:userId || 0}, data);
        var object = await me.storage.db.insertOne(me.location(name || this.id), data);
        return object;
    };
    me.remove = async function(objectId, name) {
        var object = await me.storage.db.removeOne(me.location(name || this.id), objectId);
        return object;
    };
    me.get = async function(objectId, name) {
        var object = await me.storage.db.findOne(me.location(name || this.id), objectId);
        return object;
    };
    me.set = async function(objectId, name, data) {
        var object = await me.storage.db.updateOne(me.location(name || this.id), objectId, data);
        return object;
    };
    me.list = async function(userId, name) {
        var object = await me.storage.db.list(me.location(name || this.id), {user:userId || 0});
        return object;
    };
    return "server";
};

screens.db.library.tag = function DbLibraryTag(me) {
    me.init = me.upper.extend;
};

screens.db.library.content = function DbLibraryContent(me) {
    me.init = me.upper.extend;
};
