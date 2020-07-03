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
    me.loadRecursive = async root => {
        let results = [];
        const items = await cache.listing.get(root);
        const duration = await cache.duration.get(root);
        if (duration) {
            results.push({ component: "duration", path: root, result: duration });
        }
        if (items) {
            results.push({ component: "listing", path: root, result: items });
            for (const item of items) {
                if (item.type !== "folder") {
                    continue;
                }
                results.push(...await me.loadRecursive(item.path));
            }
        }
        return results;
    };
};
