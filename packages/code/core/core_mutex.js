/*
 @author Zakai Hamilton
 @component CoreMutex
 */

screens.core.mutex = function CoreMutex(me) {
    me.use = function (id) {
        if (!me.locks) {
            me.locks = {};
        }
        var lock = me.locks[id];
        if (!lock) {
            lock = me.locks[id] = {};
            lock._locking = Promise.resolve();
            lock._locks = 0;
            lock._disabled = true;
            me.lock(id).then(unlock => {
                if (lock._disabled) {
                    lock._disabled = unlock;
                }
                else {
                    unlock();
                }
            });
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
    me.isEnabled = function (id) {
        var lock = me.use(id);
        if (lock) {
            return !lock._disabled;
        }
    };
    me.enable = function (id, enabled) {
        var lock = me.use(id);
        if (lock) {
            if (!lock._disabled !== enabled) {
                if (lock._disabled) {
                    if (typeof lock._disabled === "function") {
                        lock._disabled();
                    }
                    else {
                        lock._disabled = false;
                    }
                }
                else {
                    lock._disabled = true;
                    me.lock(id).then(unlock => {
                        if (lock._disabled) {
                            lock._disabled = unlock;
                        }
                        else {
                            unlock();
                        }
                    });
                }
            }
        }
    };
};
