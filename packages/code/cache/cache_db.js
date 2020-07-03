/*
 @author Zakai Hamilton
 @component CacheDB
 */

screens.cache.db = function CacheDB(me, { manager }) {
    me.init = async function () {
        await manager.cache.implement(me);
    };
};
