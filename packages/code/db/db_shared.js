/*
 @author Zakai Hamilton
 @component DbShared
 */

screens.db.shared = function DbShared(me) {
    return "server";
};

screens.db.shared.present = function DbSharedPresent(me) {
    me.init = me.storage.db.extension;
};

screens.db.shared.chat = function DbSharedChat(me) {
    me.init = me.storage.db.extension;
};

screens.db.shared.envision = function DbSharedEnvision(me) {
    me.init = me.storage.db.extension;
};

screens.db.shared.workshop = function DbSharedWorkshop(me) {
    me.init = me.storage.db.extension;
};

screens.db.shared.highlight = function DbSharedHighlight(me) {
    me.init = me.storage.db.extension;
};
