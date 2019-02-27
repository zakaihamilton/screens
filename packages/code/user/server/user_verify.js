/*
 @author Zakai Hamilton
 @component UserVerify
 */

screens.user.verify = function UserVerify(me) {
    me.init = async function () {
        me.core.property.link("core.socket.verify", "user.verify.verify", true);
        var login = await me.core.util.config("settings.core.login");
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
        return await me.storage.data.query(me.id);
    };
    me.verify = async function (info) {
        if (me.platform === "server" && (!info.platform || info.platform !== "service")) {
            var name = decodeURIComponent(info.headers["user_name"]);
            var email = decodeURIComponent(info.headers["user_email"]);
            var token = info.headers["token"];
            if (!token) {
                me.log_error("no token passed in header, url: " + info.url + " name: " + name);
                info.stop = true;
                return;
            }
            var hash = me.core.string.hash(token);
            try {
                var profile = await me.db.cache.tokens.find({ hash });
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
                profile.previous = profile.utc;
                profile.utc = Date.now();
                profile.request++;
                if (profile.request === 1 || profile.previous + 60000 < profile.utc) {
                    me.log("Storing profile: " + JSON.stringify(profile));
                    await me.db.cache.tokens.use({ hash }, profile);
                }
                info.userId = profile.userid;
                info.userName = profile.name;
                info.userEmail = profile.email;
                me.db.shared.user.use({ user: info.userId }, { name: info.userName, email: info.userEmail });
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