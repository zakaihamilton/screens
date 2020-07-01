/*
 @author Zakai Hamilton
 @component CacheManager
 */

screens.cache.manager = function StorageCache(me, { core, storage, db }) {
    me.metadataPath = () => {
        if (screens.platform === "server") {
            return "server/metadata";
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
    me.updateAll = async (path) => {
        db.events.msg.send(me.id + ".update", path);
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
                unique = metadata.size;
            }
        }
        catch (err) {
            unique = 0;
        }
        return unique;
    };
    me.get = async (path, update, unique) => {
        const cachePath = me.path(path);
        if (update) {
            return await me.update(path, unique);
        }
        let buffer = null;
        try {
            buffer = await storage.fs.readFile(cachePath, "utf8");
        }
        catch (err) {
            return await me.update(path, unique);
        }
        let cache = null;
        if (buffer && buffer.length && typeof buffer === "string") {
            try {
                cache = JSON.parse(buffer);
            }
            catch (err) {
                // eslint-disable-next-line no-console
                console.error(me.id + ": file '" + path + "' does not have a valid JSON, error: " + err + " length: " + buffer.length + " buffer: " + buffer);
            }
        }
        if (me.platform === "browser") {
            me.push(path, async () => {
                const unique = await me.unique(path);
                return { unique, update, path };
            });
        }
        return cache;
    };
    me.bulk = async (requests) => {
        core.mutex.enable(me.id, true);
        var unlock = await core.mutex.lock(me.id);
        try {
            for (const request of requests) {
                const { path, update, unique } = request;
                request.result = await me.get(path, update, unique);
            }
        }
        catch (err) {
            // eslint-disable-next-line no-console
            console.error("failed in bulk operation on requests, error: ", err, " requests: ", requests);
        }
        unlock();
        return requests;
    };
    me.push = (path, callback) => {
        const metadataPath = me.metadataPath();
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
            me.timer = setInterval(async () => {
                if (me.busy) {
                    return;
                }
                me.busy = true;
                try {
                    let requests = [];
                    for (; ;) {
                        const item = me.queue.pop();
                        if (!item) {
                            break;
                        }
                        const request = await item.callback();
                        requests.push(request);
                    }
                    // eslint-disable-next-line no-console
                    console.log("processing " + requests.length + " bulk requests");
                    requests = await core.message.send_server(me.id + ".bulk", requests);
                    for (const request of requests) {
                        if (!request.result) {
                            continue;
                        }
                        await storage.fs.createPath(metadataPath);
                        if (request.path) {
                            await storage.fs.createPath(metadataPath + "/" + request.path);
                        }
                        const cachePath = me.path(request.path);
                        const body = JSON.stringify(request.result, null, 4);
                        await storage.fs.writeFile(cachePath, body, "utf8");
                    }
                }
                catch (err) {
                    // eslint-disable-next-line no-console
                    console.error("failed in bulk requests: " + err);
                    me.queue.length = 0;
                }
                if (!me.queue.length) {
                    clearInterval(me.timer);
                    me.timer = null;
                }
                me.busy = false;
            }, 1000);
        }
    };
};
