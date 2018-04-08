/*
 @author Zakai Hamilton
 @component DbLibrary
 */

screens.db.library = function DbLibrary(me) {
    me.init = async function() {
        
    };
    me.location = {
        db:"library",
        collection:"object"
    };
    me.create = async function() {
        object = await me.storage.db.set(me.location, {});
        return object;
    };
    me.use = async function(objectId, name) {
        var object = await me.storage.db.get(me.location, objectId);
        if(!object) {
            return null;
        }
        if(!name) {
            return object;
        }
        name = name.split(".").pop();
        var item = object[name];
        if(!item) {
            var location = Object.assign({}, me.location, {collection:name});
            item = await me.storage.db.set(location, {});
        }
        return item;
    };
};

screens.db.library.tag = function DbLibraryTag(me) {
    me.use = async function(objectId) {
        return await me.upper.use(objectId, me.id);
    };
};
