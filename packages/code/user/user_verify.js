/*
 @author Zakai Hamilton
 @component UserVerify
 */

screens.user.verify = function UserVerify(me) {
    me.init = function (task) {
        me.lock(task, (task) => {
            me.core.util.config((google) => {
                me.client_id = google.client_id;
            }, "settings.google");
            me.unlock(task);
        });
        me.core.property.link("core.http.check", "user.verify.check", true);
    };
    me.check = function (info) {
        if (me.platform === "server" && info.method === "POST" && info.url.startsWith("/method/")) {
            var token = info.headers["token"];
            if(!token) {
                me.error("no token passed in header, url: " + info.url);
                info.stop = true;
                return;
            }
            const { OAuth2Client } = require('google-auth-library');
            const client = new OAuth2Client(me.client_id);
            async function verify() {
                const ticket = await client.verifyIdToken({
                    idToken: token,
                    audience: me.client_id,
                });
                const payload = ticket.getPayload();
                const userid = payload['sub'];
                var name = info.headers["user_name"];
                info.user = userid;
                var profile = {
                    name,
                    userid
                };
                me.log("storing user: " + name);
                await new Promise(resolve => {
                    me.log("Storing profile: " + JSON.stringify(profile));
                    me.storage.data.save(resolve, profile, "user.verify", userid);
                });
                me.log("user authenticated: " + name + " = " + userid);
            }
            me.async(info.task, verify()).catch(() => {
                me.error("failed to verify token");
                info.stop = true;
            });
        }
    };
    return "server";
};