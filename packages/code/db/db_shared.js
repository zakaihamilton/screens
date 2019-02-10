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
                var result = list.find(item => item.hash === hash);
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

screens.db.shared.commentary = function DbSharedCommentary(me) {
    me.init = () => me.storage.db.extension(me);
    me.cache = {};
    me.users = async function () {
        var users = await me.list({}, { name: 1, _id: 0 });
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
