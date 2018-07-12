/*
 @author Zakai Hamilton
 @component DbShared
 */

screens.db.shared = function DbShared(me) {
    
};

screens.db.shared.present = function DbSharedPresent(me) {
    me.init = me.storage.db.helper.extend;
};
