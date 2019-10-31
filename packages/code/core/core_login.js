/*
 @author Zakai Hamilton
 @component CoreLogin
 */

screens.core.login = function CoreLogin(me, { core, storage }) {
    me.init = async function () {
        me.state = false;
        me.wasLoggedIn = false;
        me.info = await storage.local.db.get(me.id, "info");
        if (!me.info) {
            me.info = {};
        }
        core.property.link("core.http.headers", "core.login.headers", true);
        core.property.link("core.message.headers", "core.login.headers", true);
    };
    me.load = function () {
        if (!core.util.isOnline()) {
            core.listener.signal(me.id);
            return;
        }
        var login = core.util.config("settings.core.login");
        return new Promise((resolve, reject) => {
            gapi.load("auth2", {
                callback: async function () {
                    login = await login;
                    try {
                        me.auth2 = await gapi.auth2.init({
                            client_id: login.client_id,
                            ux_mode: "redirect"
                        });
                        me.auth2.isSignedIn.listen(me.signInChanged);
                        me.auth2.currentUser.listen(me.userChanged);
                        var state = me.auth2.isSignedIn.get();
                        if (state) {
                            me.setStatus("Signed in");
                            me.updateInfo();
                            await core.listener.signal(me.id);
                        }
                        else {
                            me.log("sign in state: " + state);
                            me.setStatus("Signing in...");
                            await me.auth2.signIn();
                            await core.listener.wait(me.id);
                            me.setStatus("Sign in occured");
                        }
                        resolve();
                    }
                    catch (error) {
                        var err = "Cannot initialize google authenticiation: ";
                        if (typeof error === "string") {
                            err += error;
                        }
                        else if (error.message) {
                            err += error.message + " stack: " + error.stack;
                        }
                        else {
                            err += JSON.stringify(error);
                        }
                        me.log_error(err);
                        if (me.info.login) {
                            resolve();
                        }
                        else {
                            me.setStatus(err);
                            reject(err);
                        }
                    }
                },
                onerror: async () => {
                    me.log_error("Cannot load google authenticiation");
                    if (me.info.login) {
                        await core.listener.signal(me.id);
                        resolve();
                    }
                    else {
                        reject("Cannot load google authenticiation");
                    }
                },
                timeout: 2500,
                ontimeout: async () => {
                    me.log_error("Cannot load google authenticiation on time");
                    if (me.info.login) {
                        await core.listener.signal(me.id);
                        resolve();
                    }
                    else {
                        reject("Cannot load google authenticiation on time");
                    }
                }
            });
        });
    };
    me.setStatus = function (status) {
        me.status = status;
    };
    me.currentStatus = function () {
        return me.status;
    };
    me.currentUser = function () {
        return me.auth2.currentUser.get();
    };
    me.currentProfile = function () {
        return me.info.profile;
    };
    me.userName = function () {
        return me.info.name;
    };
    me.userEmail = function () {
        return me.info.email;
    };
    me.errors = {
        popup_closed_by_user: "Popup Closed by User",
        access_denied: "Access Denied",
        immediate_failed: "Immediate Failed"
    };
    me.signin = {
        set: function () {
            core.listener.reset(me.id);
            me.auth2.signIn().then(() => {
                core.listener.signal(me.id);
            }).catch((err) => {
                me.setStatus(me.log_errors[err.error]);
                core.listener.signal(me.id);
            });
        }
    };
    me.signout = {
        set: function () {
            core.listener.reset(me.id);
            me.auth2.signOut().then(() => {
                me.setStatus("Signed out");
                core.listener.signal(me.id);
            });
        }
    };
    me.disconnect = {
        set: function () {
            me.auth2.disconnect().then(() => {
                me.setStatus("Disconnected");
                core.listener.signal(me.id);
            });
        }
    };
    me.isSignedIn = function () {
        return me.info.login;
    };
    me.signInState = function () {
        return me.state;
    };
    me.signInChanged = function (state) {
        me.log("Signin state changed to " + state);
        me.state = state;
        if (state) {
            me.setStatus("Changed to signed in");
            core.listener.signal(me.id);
        }
        else {
            me.setStatus("Changed to not signed in");
            core.listener.signal(me.id);
        }
    };
    me.updateInfo = function () {
        var googleUser = me.auth2.currentUser.get();
        var login = me.auth2 && me.auth2.isSignedIn.get() === true;
        var profile = null, name = null, email = null, token = null;
        if (googleUser) {
            profile = googleUser.getBasicProfile();
            name = profile.getName();
            email = profile.getEmail();
            token = googleUser.getAuthResponse().id_token;
        }
        me.info = {
            profile,
            name,
            email,
            token,
            login
        };
        storage.local.db.set(me.id, "info", me.info);
    };
    me.userChanged = function (user) {
        if (user) {
            if (user.isSignedIn()) {
                me.updateInfo();
                me.setStatus("Sign in successful");
                me.log("User now: " + name);
                core.listener.signal(me.id);
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
        var token = me.info.token;
        if (me.info.login) {
            if (token) {
                if (!info.headers) {
                    info.headers = {};
                }
                info.headers["user_name"] = encodeURIComponent(me.info.name);
                info.headers["token"] = token;
                info.headers["user_email"] = encodeURIComponent(me.info.email);
            }
        }
    };
    return "browser";
};
