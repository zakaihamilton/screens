/*
 @author Zakai Hamilton
 @component CacheListing
 */

screens.cache.listing = function CacheListing(me, { cache, storage }) {
    me.init = async function () {
        await cache.manager.implement(me);
    };
    me.load = (...args) => storage.fs.list(...args);
};
