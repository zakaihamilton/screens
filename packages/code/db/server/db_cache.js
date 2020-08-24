/*
 @author Zakai Hamilton
 @component DbCache
 */

screens.db.cache = function DbCache() {
    return "server";
};

screens.db.cache.data = function DbCacheData(me, { storage }) {
    me.init = () => storage.db.extension(me);
    me.cache = true;
    me.indexes = [
        {
            "component": 1,
            "path": 1
        }
    ];
    return "server";
};

screens.db.cache.dictionary = function DbCacheDictionary(me, { storage }) {
    me.init = () => storage.db.extension(me);
    me.cache = true;
    me.indexes = [
        {
            "name": 1
        }
    ];
    return "server";
};

screens.db.cache.metadata = function DbCacheMetadata(me, { storage }) {
    me.init = () => storage.db.extension(me);
    me.cache = true;
    me.indexes = [
        {
            "name": 1
        }
    ];
    return "server";
};

screens.db.cache.tokens = function DbCacheTokens(me, { storage }) {
    me.init = () => storage.db.extension(me);
    me.cache = true;
    me.indexes = [
        {
            "hash": 1
        }
    ];
    return "server";
};

screens.db.cache.file = function DbCacheFile(me, { core, storage, db, cache }) {
    me.init = () => storage.db.extension(me);
    me.cache = true;
    me.indexes = [
        {
            "folder": 1
        }
    ];
    me.listing = async function (folder, update, callback) {
        var files = [];
        const { sessions } = await cache.path.get() || {};
        const path = folder.split("/").slice(2).join("/");
        await core.util.performance(folder + (update ? " update" : ""), async () => {
            files = await db.cache.file.list({ folder });
            if (!files || !files.length || update) {
                var children = await storage.dropbox.getChildren(folder);
                for (let file of children) {
                    file.folder = folder;
                    var exists = files && files.find(item => item.name === file.name);
                    if (!exists) {
                        let result = false;
                        if (callback) {
                            try {
                                result = await callback(file);
                            }
                            catch (err) {
                                me.log_error("error managing file: " + file.name + " err: " + err);
                                continue;
                            }
                        }
                        if (result || !exists) {
                            await db.cache.file.use({ folder, name: file.name }, file);
                        }
                        if (!exists) {
                            files.push(file);
                        }
                    }
                }
            }
        });
        await cache.stream.updateAll(userName + "/" + sessions + "/" + path);
        await cache.duration.updateAll("aws/" + sessions + "/" + path);
        await cache.listing.updateAll("aws/" + sessions + "/" + path);
        return files;
    };
    return "server";
};
