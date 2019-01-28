/*
 @author Zakai Hamilton
 @component DbCommentary
 */

screens.db.commentary = function DbCommentary(me) {
    me.users = async function () {
        var users = await me.db.commentary.entry.list({}, { name: 1, _id: 0 });
        users = users.map(user => user.name);
        return users;
    };
    return "server";
};

screens.db.commentary.entry = function DbCommentaryItem(me) {
    me.init = me.storage.db.extension;
    me.indexes = [
        {
            "hash": 1
        },
        {
            "hash": 1,
            "name": 1
        }
    ];
};
