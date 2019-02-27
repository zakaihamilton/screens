/*
 @author Zakai Hamilton
 @component DbShared
 */

screens.db.shared = function DbShared(me) {
    me.hashResults = async function (queries, hashes) {
        var results = {};
        for (let key in queries) {
            results[key] = [];
            var list = await me.db.shared[key].list(queries[key]);
            for (let hash of hashes) {
                var result = list.filter(item => item.hash === hash);
                results[key].push(result);
            }
        }
        return results;
    };
    return "server";
};

screens.db.shared.present = function DbSharedPresent(me) {
    me.init = () => me.storage.db.extension(me);
    me.cache = {};
    return "server";
};

screens.db.shared.chat = function DbSharedChat(me) {
    me.init = () => me.storage.db.extension(me);
    me.cache = {};
    return "server";
};

screens.db.shared.envision = function DbSharedEnvision(me) {
    me.init = () => me.storage.db.extension(me);
    me.cache = {};
    return "server";
};

screens.db.shared.workshop = function DbSharedWorkshop(me) {
    me.init = () => me.storage.db.extension(me);
    me.cache = {};
    return "server";
};

screens.db.shared.highlight = function DbSharedHighlight(me) {
    me.init = () => me.storage.db.extension(me);
    me.cache = {};
    me.indexes = [
        {
            "user": 1,
            "hash": 1
        }
    ];
    return "server";
};

screens.db.shared.content = function DbSharedContent(me) {
    me.init = () => me.storage.db.extension(me);
    me.cache = {};
    return "server";
};

screens.db.shared.metadata = function DbSharedContent(me) {
    me.init = () => me.storage.db.extension(me);
    me.cache = {};
    return "server";
};

screens.db.shared.commentary = function DbSharedCommentary(me) {
    me.init = () => me.storage.db.extension(me);
    me.cache = {};
    me.users = async function () {
        var users = await me.list({}, { project: { name: 1, _id: 0 } });
        users = users.map(user => user.name);
        return users;
    };
    me.indexes = [
        {
            "hash": 1
        },
        {
            "hash": 1,
            "name": 1
        }
    ];
    return "server";
};

screens.db.shared.message = function DbSharedContent(me) {
    me.init = () => me.storage.db.extension(me);
    me.cache = {};
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
        data.unique = me.core.util.random();
        if (data.user) {
            me.push(data);
        }
        else {
            var users = me.db.shared.user.list();
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

screens.db.shared.user = function DbSharedUser(me) {
    me.init = () => me.storage.db.extension(me);
    me.cache = {};
    me.indexes = [
        {
            "user": 1
        }
    ];
    return "server";
};
