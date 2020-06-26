/*
 @author Zakai Hamilton
 @component CacheManager
 */

screens.cache.manager = function StorageCache(me, { core, storage }) {
    me.cache = {
        metadataPath: () => {
            if (screens.platform === "server") {
                return "aws/" + storage.aws.bucket + "/metadata";
            }
            else {
                return "local/metadata";
            }
        },
        update: async (path, unique = null) => {
            let cache = null;
            const cachePath = me.path(path);
            if (screens.platform === "server") {
                if (unique && unique === me.unique(path)) {
                    return null;
                }
                cache = await me.load(path);
            }
            else {
                cache = await core.message.send_server(me.id + ".cache.get", path);
            }
            const body = cache ? JSON.stringify(cache, null, 4) : "";
            const metadataPath = me.cache.metadataPath();
            await storage.fs.createPath(metadataPath + "/" + path);
            await storage.fs.writeFile(cachePath, body, "utf8");
            return cache;
        },
        path: path => {
            var [, component] = me.id.split(".");
            const metadataPath = me.cache.metadataPath();
            return metadataPath + "/" + path + "/" + component + ".json";
        },
        unique: async path => {
            let unique;
            try {
                const metadata = storage.fs.stat(me.path(path));
                if (metadata) {
                    unique = metadata.date + metadata.size;
                }
            }
            catch (err) {
                unique = 0;
            }
            return unique;
        },
        get: async path => {
            const cachePath = me.path(path);
            if (!await storage.fs.exists(cachePath)) {
                return await me.cache.update(path);
            }
            const buffer = await storage.fs.readFile(cachePath, "utf8");
            const cache = JSON.parse(buffer);
            me.unique(path).then(localUnique => {
                core.message.send_server(me.id + ".cache.update", path, localUnique).then(cache => {
                    if (cache) {
                        storage.fs.writeFile(cachePath, cache, "utf8");
                    }
                });
            });
            return cache;
        }
    };
    return me.cache;
};
