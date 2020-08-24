/*
 @author Zakai Hamilton
 @component CacheListing
 */

screens.cache.listing = function CacheListing(me, { cache, manager, storage }) {
    me.init = async function () {
        await manager.cache.implement(me);
    };
    me.load = (...args) => {
        return storage.fs.list(...args);
    };
    me.loadRecursive = async (root, userName) => {
        let results = [];
        const items = await cache.listing.get(root);
        const duration = await cache.duration.get(root);
        const stream = await cache.stream.get(root);
        if (items) {
            results.push({ component: "listing", path: root, result: items });
            for (const item of items) {
                if (item.type !== "folder") {
                    continue;
                }
                results.push(...await me.loadRecursive(item.path, userName));
            }
        }
        if (duration) {
            results.push({ component: "duration", path: root, result: duration });
        }
        if (stream) {
            results.push({ component: "stream", path: userName, result: stream });
        }
        return results;
    };
};
