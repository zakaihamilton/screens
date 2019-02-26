/*
 @author Zakai Hamilton
 @component DbCache
 */

screens.db.cache = function DbCache(me) {
    return "server";
};

screens.db.cache.data = function DbCacheData(me) {
    me.init = () => me.storage.db.extension(me);
    me.cache = {};
    me.indexes = [
        {
            "component": 1,
            "path": 1
        }
    ];
    return "server";
};

screens.db.cache.dictionary = function DbCacheDictionary(me) {
    me.init = () => me.storage.db.extension(me);
    me.cache = {};
    me.indexes = [
        {
            "name": 1
        }
    ];
    return "server";
};

screens.db.cache.metadata = function DbCacheMetadata(me) {
    me.init = () => me.storage.db.extension(me);
    me.cache = {};
    me.indexes = [
        {
            "name": 1
        }
    ];
    return "server";
};

screens.db.cache.file = function DbCacheFile(me) {
    me.init = () => me.storage.db.extension(me);
    me.cache = {};
    me.indexes = [
        {
            "folder": 1
        }
    ];
    me.listing = async function (folder, update, callback) {
        var files = [];
        await me.core.util.performance(folder + (update ? " update" : ""), async () => {
            files = await me.db.cache.file.list({ folder });
            if (!files || !files.length || update) {
                var children = await me.storage.file.getChildren(folder);
                for (let file of children) {
                    file.folder = folder;
                    var exists = files && files.find(item => item.name === file.name);
                    if (!exists) {
                        if (callback) {
                            await callback(file);
                        }
                        await me.db.cache.file.use({ folder, name: file.name }, file);
                        files.push(file);
                    }
                }
            }
        });
        return files;
    };
    return "server";
};
