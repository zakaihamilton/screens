/*
 @author Zakai Hamilton
 @component LibGoogle
 */

screens.lib.google = function LibGoogle(me) {
    me.init = function (task) {
        me.state = false;
        me.core.property.link("core.http.headers", "lib.google.headers", true);
        me.lock(task, (task) => {
            me.core.util.config((google) => {
                me.core.require(() => {
                    gapi.load('auth2', function () {
                        me.auth2 = gapi.auth2.init({
                            client_id: google.client_id
                        });
                        me.auth2.isSignedIn.listen(me.signInChanged);
                        me.auth2.currentUser.listen(me.userChanged);
                        if (me.auth2.isSignedIn.get() === true) {
                            me.status = "Signing in...";
                            me.auth2.signIn().catch(err => {
                                me.status = err.message || err;
                            });
                            me.core.listener.wait(() => {
                                me.unlock(task);
                            }, me.id);
                        }
                        else {
                            me.status = "Not signed in";
                            me.unlock(task);
                        }
                    });
                }, ["https://apis.google.com/js/api:client.js"]);
            }, "settings.google");
        });
    };
    me.currentStatus = function() {
        return me.status;
    };
    me.currentUser = function () {
        return me.auth2.currentUser.get();
    };
    me.currentProfile = function() {
        var googleUser = me.auth2.currentUser.get();
        return googleUser.getBasicProfile();
    };
    me.currentName = function() {
        var profile = me.currentProfile();
        if(!profile) {
            return "";
        }
        return profile.getName();
    };
    me.signin = function (callback, object, googleUser) {
        me.status = "Received sign in";
        if (callback) {
            callback();
        }
    };
    me.signout = {
        set: function (object) {
            me.auth2.signOut().then(function () {
                me.log('User signed out.');
            });
        }
    };
    me.disconnect = {
        set: function (object) {
            me.auth2.disconnect();
        }
    };
    me.attachSignIn = {
        set: function (object, value) {
            me.auth2.attachClickHandler(object, {}, (googleUser) => {
                me.signin(value, object, googleUser);
            }, me.error);
        }
    };
    me.isSignedIn = function() {
        if(!me.auth2) {
            return false;
        }
        return me.auth2.isSignedIn.get();
    };
    me.signInState = function() {
        return me.state;
    };
    me.signInChanged = function (state) {
        me.log("Signin state changed to " + state);
        me.state = state;
        if(state) {
            me.status = "Signed in";
        }
        else {
            me.status = "Not signed in";
        }
        me.core.listener.signal(null, me.id);
    };
    me.userChanged = function (user) {
        if(user) {
            var profile = user.getBasicProfile();
            if(profile) {
                var name = profile.getName();
                me.status = "Sign in successful";
                me.log("User now: " + name);
                me.core.listener.signal(null, me.id);
            }
            else {
                me.status = "No signed in user (No profile)";
            }
        }
        else {
            me.status = "No signed in user";
        }
    };
    me.headers = function(info) {
        var token = null;
        if(me.isSignedIn()) {
            var user = me.currentUser();
            token = user.getAuthResponse().id_token
            if(token) {
                var profile = user.getBasicProfile();
                info.headers["user_name"] = profile.getName();
                info.headers["token"] = token;
            }
        }
    };
};
