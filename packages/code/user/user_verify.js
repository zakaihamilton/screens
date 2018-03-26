/*
 @author Zakai Hamilton
 @component UserVerify
 */

package.user.verify = function UserVerify(me) {
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
            var user_id = info.headers["user_id"];
            if(!user_id) {
                me.error("no user_id token passed in header");
                info.stop = true;
                return;
            }
            const { OAuth2Client } = require('google-auth-library');
            const client = new OAuth2Client(me.client_id);
            async function verify() {
                const ticket = await client.verifyIdToken({
                    idToken: user_id,
                    audience: google.client_id,
                });
                const payload = ticket.getPayload();
                const userid = payload['sub'];
            }
            me.async(info.task, verify()).catch(() => {
                me.error("failed to verify user id");
                info.stop = true;
            });
        }
    };
    return "server";
};