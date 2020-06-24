/*
 @author Zakai Hamilton
 @component StorageCache
 */

screens.storage.cache = function StorageCache(me, { core, storage }) {
    me.cache = {
        metadataPath: () => {
            if (!me.metadata) {
                if (screens.platform === "server") {
                    me.metadata = "aws/" + storage.aws.bucket + "/metadata";
                }
                else {
                    me.metadata = "local/metadata";
                }
            }
            return me.metadata;
        },
        update: async path => {
            var [, component] = me.id.split(".");
            let cache = null;
            if (screens.platform === "server") {
                cache = await me.load(path);
            }
            else {
                cache = await core.message.send_server(me.id + ".cache.update", path);
            }
            const body = cache ? JSON.stringify(cache, null, 4) : "";
            const metadataPath = me.cache.metadataPath();
            await storage.fs.createPath(metadataPath + "/" + path);
            await storage.fs.writeFile(metadataPath + "/" + path + "/" + component + ".json", body, "utf8");
            return cache;
        },
        get: async path => {
            var [, component] = me.id.split(".");
            const metadataPath = me.cache.metadataPath();
            const cachePath = metadataPath + "/" + path + "/" + component + ".json";
            if (!await storage.fs.exists(cachePath)) {
                return await me.cache.update(path);
            }
            const buffer = await storage.fs.readFile(cachePath, "utf8");
            const cache = JSON.parse(buffer);
            return cache;
        }
    };
    return me.cache;
};
