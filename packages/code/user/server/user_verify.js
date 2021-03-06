/*
 @author Zakai Hamilton
 @component UserVerify
 */

screens.user.verify = function UserVerify(me, { core, db }) {
    me.init = async function () {
        var login = await core.util.config("settings.core.login");
        me.client_id = login.client_id;
        const { OAuth2Client } = require("google-auth-library");
        me.client = new OAuth2Client(me.client_id);
    };
    me.match = function (id) {
        var isMatch = (id === this.userId);
        me.log("name: " + name + " isMatch:" + isMatch);
        return isMatch;
    };
    me.list = async function () {
        return await db.shared.user.list();
    };
    me.verify = async function (info) {
        if (me.platform === "server" && !info.platform) {
            var name = decodeURIComponent(info.headers["user_name"]);
            var email = decodeURIComponent(info.headers["user_email"]);
            var token = info.headers["token"];
            if (!token) {
                me.log_error("no token passed in header, url: " + info.url + " name: " + name);
                info.stop = true;
                return;
            }
            var hash = core.string.hash(token);
            try {
                var profile = await db.cache.tokens.find({ hash });
                if (!profile) {
                    const ticket = await me.client.verifyIdToken({
                        idToken: token,
                        audience: me.client_id,
                    });
                    const payload = ticket.getPayload();
                    const userid = payload["sub"];
                    profile = { userid, name, email, request: 0 };
                }
                profile.date = new Date().toString();
                let previous = profile.previous;
                profile.previous = profile.utc;
                profile.utc = Date.now();
                profile.request++;
                if (profile.request === 1 || previous + 60000 < profile.utc) {
                    me.log("Storing profile: " + JSON.stringify(profile));
                    await db.cache.tokens.use({ hash }, profile);
                }
                info.userId = profile.userid;
                info.userName = profile.name;
                info.userEmail = profile.email;
                let user = await db.shared.user.find({ user: info.userId });
                if (!user || user.name !== info.userName || user.email !== info.userEmail) {
                    db.shared.user.use({ user: info.userId }, { name: info.userName, email: info.userEmail });
                }
            }
            catch (err) {
                let error = "failed to verify token, err: " + err;
                me.log_error(error);
                info.stop = true;
            }
        }
    };
    return "server";
};