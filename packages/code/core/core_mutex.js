/*
 @author Zakai Hamilton
 @component CoreMutex
 */

screens.core.mutex = function CoreMutex(me) {
    me.init = function () {
        me._locking = Promise.resolve();
        me._locks = 0;
    };
    me.isLocked = function () {
        return me._locks > 0;
    };
    me.lock = function () {
        me._locks += 1;
        let unlockNext;
        let willLock = new Promise(resolve => unlockNext = () => {
            me._locks -= 1;
            resolve();
        });
        let willUnlock = me._locking.then(() => unlockNext);
        me._locking = me._locking.then(() => willLock);
        return willUnlock;
    };
};
