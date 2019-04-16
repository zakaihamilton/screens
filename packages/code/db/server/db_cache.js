/*
 @author Zakai Hamilton
 @component DbCache
 */

screens.db.cache = function DbCache(me, packages) {
    return "server";
};

screens.db.cache.data = function DbCacheData(me, packages) {
    const { storage } = packages;
    me.init = () => storage.db.extension(me);
    me.cache = {};
    me.indexes = [
        {
            "component": 1,
            "path": 1
        }
    ];
    return "server";
};

screens.db.cache.dictionary = function DbCacheDictionary(me, packages) {
    const { storage } = packages;
    me.init = () => storage.db.extension(me);
    me.cache = {};
    me.indexes = [
        {
            "name": 1
        }
    ];
    return "server";
};

screens.db.cache.metadata = function DbCacheMetadata(me, packages) {
    const { storage } = packages;
    me.init = () => storage.db.extension(me);
    me.cache = {};
    me.indexes = [
        {
            "name": 1
        }
    ];
    return "server";
};

screens.db.cache.tokens = function DbCacheTokens(me, packages) {
    const { storage } = packages;
    me.init = () => storage.db.extension(me);
    me.cache = {};
    me.indexes = [
        {
            "hash": 1
        }
    ];
    return "server";
};

screens.db.cache.file = function DbCacheFile(me, packages) {
    const { core, storage, db } = packages;
    me.init = () => storage.db.extension(me);
    me.cache = {};
    me.indexes = [
        {
            "folder": 1
        }
    ];
    me.listing = async function (folder, update, callback) {
        var files = [];
        await core.util.performance(folder + (update ? " update" : ""), async () => {
            let updateNew = false, updateExisting = false;
            if (typeof update === "object") {
                updateNew = update.new;
                updateExisting = update.existing;
            }
            else {
                updateNew = update;
            }
            files = await db.cache.file.list({ folder });
            if (!files || !files.length || updateNew || updateExisting) {
                var children = await storage.dropbox.getChildren(folder);
                for (let file of children) {
                    file.folder = folder;
                    var exists = files && files.find(item => item.name === file.name);
                    if ((!exists && updateNew) || updateExisting) {
                        if (callback) {
                            try {
                                await callback(file);
                            }
                            catch (err) {
                                me.log_error("error managing file: " + file.name + " err: " + err);
                                continue;
                            }
                        }
                        await db.cache.file.use({ folder, name: file.name }, file);
                        files.push(file);
                    }
                }
            }
        });
        return files;
    };
    return "server";
};
