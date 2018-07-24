/*
 @author Zakai Hamilton
 @component UserProfile
 */

screens.user.profile = function UserProfile(me) {
    me.get = async function(user) {
        if(!user) {
            user = this.userId;
        }
        return await me.storage.data.load("app.profile", user);
    };
    me.set = async function(profile, user) {
        if(!user) {
            user = this.userId;
        }
        await me.storage.data.save(profile, "app.profile", user);
        await me.storage.data.save(profile, me.id, user);
    };
    return "server";
};
