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
        if (screens.platform === "server") {
            const serverUnique = await me.unique(path);
            if (unique && unique === serverUnique) {
                return null;
            }
            if (me.load) {
                cache = await me.load(path);
            }
        }
        else {
            cache = await core.message.send_server(me.id + ".get", path, true);
        }
        if (cache) {
            await me.write(path, cache);
        }
        return cache;
    };
    me.read = async (path) => {
        const cachePath = me.path(path);
        let buffer = null;
        try {
            buffer = await storage.fs.readFile(cachePath, "utf8");
        }
        catch (err) {
            buffer = null;
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
        return cache;
    };
    me.write = async (path, data) => {
        const cachePath = me.path(path);
        const body = data ? JSON.stringify(data, "", 4) : "";
        const metadataPath = me.metadataPath();
        await storage.fs.createPath(metadataPath);
        if (path) {
            await storage.fs.createPath(metadataPath + "/" + path);
        }
        await storage.fs.writeFile(cachePath, body, "utf8");
    };
    me.delete = async (path) => {
        const cachePath = me.path(path);
        await storage.fs.delete(cachePath);
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
            unique = -1;
        }
        return unique;
    };
    me.get = async (path, update, unique) => {
        let cache = null;
        if (update) {
            cache = await me.update(path, unique);
            if (cache) {
                return;
            }
        }
        try {
            cache = await me.read(path);
        }
        catch (err) {
            return await me.update(path, unique);
        }
        if (me.platform === "browser") {
            me.push(path, async () => {
                const unique = await me.unique(path);
                return { unique, update: true, path };
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
                if (update) {
                    request.result = await me.update(path, unique);
                }
                else {
                    request.result = await me.get(path, false, unique);
                }
            }
        }
        catch (err) {
            // eslint-disable-next-line no-console
            console.error("failed in bulk operation on requests, error: ", err, " requests: ", requests);
        }
        unlock();
        // eslint-disable-next-line no-console
        const updated = requests.filter(request => request.result);
        if (updated.length) {
            // eslint-disable-next-line no-console
            console.log("updated " + updated.length + " cache requests: " + updated.map(item => item.path).join("\n"));
        }
        const results = requests.map(request => request.result);
        return results;
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
                    const updated = [];
                    const results = await core.message.send_server(me.id + ".bulk", requests);
                    for (let requestIndex = 0; requestIndex < requests.length; requestIndex++) {
                        const request = requests[requestIndex];
                        const result = results[requestIndex];
                        if (!result) {
                            continue;
                        }
                        await me.write(request.path, result);
                        updated.push(request.path);
                    }
                    if (updated.length) {
                        core.broadcast.send("cacheUpdated", updated);
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
