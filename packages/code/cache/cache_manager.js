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
        await storage.fs.createPath(metadataPath);
        if (path) {
            await storage.fs.createPath(metadataPath + "/" + path);
        }
        await storage.fs.writeFile(cachePath, body, "utf8");
        return cache;
    };
    me.path = path => {
        path = path || "";
        var [, component] = me.id.split(".");
        const metadataPath = me.metadataPath();
        return [metadataPath, path, component + ".json"].filter(Boolean).join("/");
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
    me.get = async (path, update) => {
        const cachePath = me.path(path);
        if (update) {
            return await me.update(path);
        }
        let buffer = null;
        try {
            buffer = await storage.fs.readFile(cachePath, "utf8");
        }
        catch (err) {
            return await me.update(path);
        }
        let cache = null;
        if (buffer && buffer.length) {
            cache = JSON.parse(buffer);
        }
        me.push(path, async () => {
            const unique = await me.unique(path);
            const cache = await core.message.send_server(me.id + ".update", path, unique);
            if (cache) {
                const body = cache ? JSON.stringify(cache, null, 4) : "";
                await storage.fs.writeFile(cachePath, body, "utf8");
            }
        });
        return cache;
    };
    me.push = (path, callback) => {
        if (!me.queue) {
            me.queue = [];
        }
        const exists = me.queue.find(item => item.path === path);
        if (exists) {
            return;
        }
        me.queue.push({
            path,
            callback
        });
        if (!me.timer) {
            me.timer = setTimeout(async () => {
                for (; ;) {
                    const item = me.queue.pop();
                    if (!item) {
                        break;
                    }
                    await item.callback();
                }
                clearTimeout(me.timer);
                me.timer = null;
            }, 1000);
        }
    };
};
