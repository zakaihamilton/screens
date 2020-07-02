/*
 @author Zakai Hamilton
 @component CacheDB
 */

screens.cache.db = function CacheDB(me, { cache }) {
    me.init = async function () {
        await cache.manager.implement(me);
    };
};
