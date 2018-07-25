/*
 @author Zakai Hamilton
 @component UserChat
 */

screens.user.chat = function UserChat(me) {
    me.messages = function(user) {
        if(!user) {
            user = this.userId;
        }
        me.db.shared.chat.list({user});
    };
    return "server";
};
