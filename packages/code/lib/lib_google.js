/*
 @author Zakai Hamilton
 @component LibGoogle
 */

screens.lib.google = function LibGoogle(me) {
    me.init = async function () {
        me.state = false;
        me.core.property.link("core.http.headers", "lib.google.headers", true);
        me.core.property.link("core.message.headers", "lib.google.headers", true);
    }
    me.load = function() {
        var google = me.core.util.config("settings.lib.google");
        return new Promise((resolve, reject) => {
            gapi.load('auth2', async function () {
                google = await google;
                try {
                    me.auth2 = await gapi.auth2.init({
                        client_id: google.client_id
                    });
                    me.auth2.isSignedIn.listen(me.signInChanged);
                    me.auth2.currentUser.listen(me.userChanged);
                    var state = me.auth2.isSignedIn.get();
                    if (state) {
                        me.setStatus("Signed in");
                    }
                    else {
                        me.log("sign in state: " + state);
                        me.setStatus("Signing in...");
                        await me.auth2.signIn();
                        await me.core.listener.wait(me.id);
                        me.setStatus("Sign in occured");
                    }
                    resolve();
                }
                catch(error) {
                    error = "Cannot initialize google authenticiation: " + JSON.stringify(error);
                    me.setStatus(error);
                    reject(error);
                }
            });
        });
    };
    me.setStatus = function (status) {
        me.status = status;
        me.log("status: " + status);
    };
    me.currentStatus = function () {
        return me.status;
    };
    me.currentUser = function () {
        return me.auth2.currentUser.get();
    };
    me.currentProfile = function () {
        var googleUser = me.auth2.currentUser.get();
        if (googleUser) {
            return googleUser.getBasicProfile();
        }
        return null;
    };
    me.userName = function () {
        var profile = me.currentProfile();
        if (!profile) {
            return "";
        }
        return profile.getName();
    };
    me.userEmail = function () {
        var profile = me.currentProfile();
        if (!profile) {
            return "";
        }
        return profile.getEmail();
    };
    me.errors = {
        popup_closed_by_user: "Popup Closed by User",
        access_denied: "Access Denied",
        immediate_failed: "Immediate Failed"
    };
    me.signin = {
        set: function (object) {
            me.core.listener.reset(me.id);
            me.auth2.signIn().then(() => {
                me.core.listener.signal(me.id);
            }).catch((err) => {
                me.setStatus(me.log_errors[err.error]);
                me.core.listener.signal(me.id);
            });
        }
    };
    me.signout = {
        set: function (object) {
            me.core.listener.reset(me.id);
            me.auth2.signOut().then(() => {
                me.setStatus("Signed out");
                me.core.listener.signal(me.id);
            });
        }
    };
    me.disconnect = {
        set: function (object) {
            me.auth2.disconnect().then(() => {
                me.setStatus("Disconnected");
                me.core.listener.signal(me.id);
            });
        }
    };
    me.isSignedIn = function () {
        var isSignedIn = false;
        if (me.auth2 && me.auth2.isSignedIn.get() === true) {
            var user = me.auth2.currentUser.get();
            if (user) {
                var profile = user.getBasicProfile();
                if (profile) {
                    isSignedIn = true;
                }
            }
        }
        return isSignedIn;
    };
    me.signInState = function () {
        return me.state;
    };
    me.signInChanged = function (state) {
        me.log("Signin state changed to " + state);
        me.state = state;
        if (state) {
            me.setStatus("Changed to signed in");
            me.core.listener.signal(me.id);
        }
        else {
            me.setStatus("Changed to not signed in");
            me.core.listener.signal(me.id);
        }
    };
    me.userChanged = function (user) {
        if (user) {
            if (user.isSignedIn()) {
                var profile = user.getBasicProfile();
                if (profile) {
                    var name = profile.getName();
                    me.setStatus("Sign in successful");
                    me.log("User now: " + name);
                    me.core.listener.signal(me.id);
                }
                else {
                    me.setStatus("No profile for signed in user");
                }
            }
            else {
                me.setStatus("User not signed in");
            }
        }
        else {
            me.setStatus("No user");
        }
    };
    me.headers = function (info) {
        var token = null;
        if (me.isSignedIn()) {
            var user = me.currentUser();
            token = user.getAuthResponse().id_token
            if (token) {
                var profile = user.getBasicProfile();
                if(!info.headers) {
                    info.headers = {};
                }
                info.headers["user_name"] = encodeURIComponent(profile.getName());
                info.headers["token"] = token;
            }
        }
    };
};
