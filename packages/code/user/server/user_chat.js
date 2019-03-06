/*
 @author Zakai Hamilton
 @component UserChat
 */

screens.user.chat = function UserChat(me, packages) {
    const { db } = packages;
    me.messages = function (user) {
        if (!user) {
            user = this.userId;
        }
        db.shared.chat.list({ user });
    };
    return "server";
};
