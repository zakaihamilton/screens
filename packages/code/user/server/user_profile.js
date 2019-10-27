/*
 @author Zakai Hamilton
 @component UserProfile
 */

screens.user.profile = function UserProfile(me, { db, storage }) {
    me.profiles = null;
    me.reset = function () {
        me.profiles = null;
    };
    me.get = async function (user) {
        if (!user) {
            user = this.userId;
        }
        return await storage.data.load("app.profile", user);
    };
    me.set = async function (profile, user) {
        if (!user) {
            user = this.userId;
        }
        await storage.data.save(profile, "app.profile", user);
        await storage.data.save(profile, me.id, user);
        db.events.msg.send(me.id + ".reset");
    };
    me.list = async function () {
        if (me.profiles) {
            return me.profiles;
        }
        var profiles = await storage.data.query("app.profile");
        me.profiles = profiles;
        return profiles;
    };
    return "server";
};
