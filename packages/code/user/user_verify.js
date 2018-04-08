/*
 @author Zakai Hamilton
 @component UserVerify
 */

screens.user.verify = function UserVerify(me) {
    me.init = async function () {
        me.core.property.link("core.http.check", "user.verify.check", true);
        var google = await me.core.util.config("settings.google");
        me.client_id = google.client_id;
    };
    me.check = async function (info) {
        if (me.platform === "server" && info.method === "POST" && info.url.startsWith("/method/")) {
            var name = info.headers["user_name"];
            var token = info.headers["token"];
            if(!token) {
                me.error("no token passed in header, url: " + info.url + " name: " + name);
                info.stop = true;
                return;
            }
            const { OAuth2Client } = require('google-auth-library');
            me.log("verifying user: " + name);
            try {
                const client = new OAuth2Client(me.client_id);
                const ticket = await client.verifyIdToken({
                    idToken: token,
                    audience: me.client_id,
                });
                const payload = ticket.getPayload();
                const userid = payload['sub'];
                info.user = userid;
                var profile = {
                    name,
                    userid,
                    date: new Date().toString()
                };
                me.log("Storing profile: " + JSON.stringify(profile));
                await me.storage.data.save(profile, "user.verify", userid);
            }
            catch(err) {
                err = "failed to verify token, err: " + err;
                me.error(err);
                info.stop = true;
            }
        }
    };
    return "server";
};