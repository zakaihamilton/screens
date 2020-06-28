/*
 @author Zakai Hamilton
 @component CacheManager
 */

screens.cache.manager = function StorageCache(me, { core, storage }) {
    me.metadataPath = () => {
        if (screens.platform === "server") {
            return "aws/" + storage.aws.bucket + "/metadata";
        }
        else {
            return "local/metadata";
        }
    };
    me.update = async (path, unique = null) => {
        let cache = null;
        const cachePath = me.path(path);
        if (screens.platform === "server") {
            if (unique && unique === me.unique(path)) {
                return null;
            }
            cache = await me.load(path);
        }
        else {
            cache = await core.message.send_server(me.id + ".get", path);
        }
        const body = cache ? JSON.stringify(cache, null, 4) : "";
        const metadataPath = me.metadataPath();
        await storage.fs.createPath(metadataPath + "/" + path);
        await storage.fs.writeFile(cachePath, body, "utf8");
        return cache;
    };
    me.path = path => {
        path = path || "";
        var [, component] = me.id.split(".");
        const metadataPath = me.metadataPath();
        return metadataPath + "/" + path + "/" + component + ".json";
    };
    me.unique = async path => {
        let unique;
        try {
            const metadata = await storage.fs.stat(me.path(path));
            if (metadata) {
                unique = metadata.date + metadata.size;
            }
        }
        catch (err) {
            unique = 0;
        }
        return unique;
    };
    me.get = async path => {
        const cachePath = me.path(path);
        if (!await storage.fs.exists(cachePath)) {
            return await me.update(path);
        }
        const buffer = await storage.fs.readFile(cachePath, "utf8");
        let cache = null;
        if (buffer && buffer.length) {
            cache = JSON.parse(buffer);
        }
        me.unique(path).then(unique => {
            core.message.send_server(me.id + ".update", path, unique).then(cache => {
                if (cache) {
                    const body = cache ? JSON.stringify(cache, null, 4) : "";
                    storage.fs.writeFile(cachePath, body, "utf8");
                }
            });
        });
        return cache;
    };
};
