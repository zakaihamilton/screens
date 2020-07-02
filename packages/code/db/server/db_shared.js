/*
 @author Zakai Hamilton
 @component DbShared
 */

screens.db.shared = function DbShared() {
    return "server";
};

screens.db.shared.present = function DbSharedPresent(me, { storage }) {
    me.init = () => storage.db.extension(me);
    me.cache = true;
    return "server";
};

screens.db.shared.chat = function DbSharedChat(me, { storage }) {
    me.init = () => storage.db.extension(me);
    me.cache = true;
    return "server";
};

screens.db.shared.workshop = function DbSharedWorkshop(me, { storage }) {
    me.init = () => storage.db.extension(me);
    me.cache = true;
    return "server";
};

screens.db.shared.highlight = function DbSharedHighlight(me, { storage }) {
    me.init = () => storage.db.extension(me);
    me.cache = true;
    me.indexes = [
        {
            "user": 1,
            "hash": 1
        }
    ];
    return "server";
};

screens.db.shared.content = function DbSharedContent(me, { storage }) {
    me.init = () => storage.db.extension(me);
    me.cache = true;
    return "server";
};

screens.db.shared.metadata = function DbSharedContent(me, { storage }) {
    me.init = () => storage.db.extension(me);
    me.cache = true;
    return "server";
};

screens.db.shared.message = function DbSharedContent(me, { core, storage, db }) {
    me.init = () => storage.db.extension(me);
    me.cache = true;
    me.listing = async function (user) {
        if (!user) {
            user = this.userId;
        }
        return me.list({ user });
    };
    me.send = function (data, user) {
        if (!user) {
            user = this.userId;
        }
        data.unique = core.util.random();
        if (data.user) {
            me.push(data);
        }
        else {
            var users = db.shared.user.list();
            for (let user of users) {
                data.user = user.user;
                me.push(data);
            }
        }
        return data.unique;
    };
    me.mark = function (unique, user) {
        if (!user) {
            user = this.userId;
        }
        me.remove({ unique, user });
    };
    return "server";
};

screens.db.shared.user = function DbSharedUser(me, { storage }) {
    me.init = () => storage.db.extension(me);
    me.cache = true;
    me.indexes = [
        {
            "user": 1
        }
    ];
    return "server";
};

screens.db.shared.stream = function DbSharedStream(me, { storage }) {
    me.init = () => storage.db.extension(me);
    me.cache = true;
    me.indexes = [
        {
            "user": 1,
            "group": 1,
            "session": 1
        }
    ];
    return "server";
};

screens.db.shared.settings = function DbSharedSettings(me, { storage }) {
    me.init = () => storage.db.extension(me);
    me.cache = true;
    me.indexes = [
        {
            "key": 1
        }
    ];
    me.get = async function (key) {
        let item = await me.find({ key });
        if (item) {
            return item.value;
        }
        else {
            return null;
        }
    };
    me.set = function (key, value) {
        if (value) {
            me.use({ key }, { value });
        }
        else {
            me.remove({ key });
        }
    };
    return "server";
};