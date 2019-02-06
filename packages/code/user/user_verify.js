/*
 @author Zakai Hamilton
 @component UserVerify
 */

screens.user.verify = function UserVerify(me) {
    me.init = async function () {
        me.core.property.link("core.socket.verify", "user.verify.verify", true);
        var login = await me.core.util.config("settings.core.login");
        me.client_id = login.client_id;
        me.tokens = {};
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
            try {
                var profile = me.tokens[token];
                if (!profile) {
                    const ticket = await me.client.verifyIdToken({
                        idToken: token,
                        audience: me.client_id,
                    });
                    const payload = ticket.getPayload();
                    const userid = payload['sub'];
                    profile = await me.storage.data.load(me.id, userid);
                    if (!profile) {
                        profile = {};
                    }
                    me.log("Found profile: " + JSON.stringify(profile));
                    profile.userid = userid;
                    profile.name = name;
                    profile.email = email;
                    if (!profile.request) {
                        profile.request = 0;
                    }
                    me.tokens[token] = profile;
                }
                profile.date = new Date().toString();
                profile.previous = profile.utc;
                profile.utc = Date.now();
                profile.request++;
                if (profile.previous + 60000 < profile.utc) {
                    me.log("Storing profile: " + JSON.stringify(profile));
                    me.storage.data.save(profile, me.id, profile.userid);
                }
                info.userId = profile.userid;
                info.userName = profile.name;
                info.userEmail = profile.email;
            }
            catch (err) {
                let error = "failed to verify token, err: " + err;
                me.log_error(error);
                info.stop = true;
            }
        }
    };
    me.heartbeat = function () {
        me.db.events.heartbeat.push({
            user: this.userId,
            name: this.userName,
            date: new Date().toString(),
            utc: Date.now()
        });
    };
    return "server";
};