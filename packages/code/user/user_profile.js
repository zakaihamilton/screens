/*
 @author Zakai Hamilton
 @component UserProfile
 */

screens.user.profile = function UserProfile(me) {
    me.get = async function(user) {
        if(!user) {
            user = this.userId;
        }
        return await me.core.cache.use(me.id + "." + user, "storage.data.load", "app.profile", user);
    };
    me.set = async function(profile, user) {
        if(!user) {
            user = this.userId;
        }
        await me.storage.data.save(profile, "app.profile", user);
        await me.storage.data.save(profile, me.id, user);
        me.core.cache.reset(me.id + "." + user);
    };
    me.list = async function() {
        return await me.storage.data.query("app.profile");
    };
    return "server";
};
