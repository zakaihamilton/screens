/*
 @author Zakai Hamilton
 @component CoreMutex
 */

screens.core.mutex = function CoreMutex(me) {
    me.init = function () {
        me.locks = {};
    };
    me.use = function (id) {
        var lock = me.locks[id];
        if (!lock) {
            lock = me.locks[id] = {};
            lock._locking = Promise.resolve();
            lock._locks = 0;
        }
        return lock;
    };
    me.isLocked = function (id) {
        var lock = me.use(id);
        if (lock) {
            return lock._locks > 0;
        }
    };
    me.lock = function (id) {
        var lock = me.use(id);
        if (lock) {
            lock._locks += 1;
            let unlockNext;
            let willLock = new Promise(resolve => unlockNext = () => {
                lock._locks -= 1;
                resolve();
            });
            let willUnlock = lock._locking.then(() => unlockNext);
            lock._locking = lock._locking.then(() => willLock);
            return willUnlock;
        }
    };
};
