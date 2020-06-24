/*
 @author Zakai Hamilton
 @component StorageListing
 */

screens.storage.listing = function StorageListing(me, { storage }) {
    me.init = async function () {
        await storage.cache.implement(me);
    };
    me.load = (...args) => storage.fs.list(...args);
};
