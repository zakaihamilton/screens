/*
 @author Zakai Hamilton
 @component DbCache
 */

screens.db.cache = function DbCache(me) {
    return "server";
};

screens.db.cache.file = function DbCacheFile(me) {
    me.init = () => me.storage.db.extension(me);
    me.listing = async function (folder, update, callback) {
        var files = await me.db.cache.file.list({ folder });
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
                }
            }
        }
        return files;
    };
    return "server";
};
