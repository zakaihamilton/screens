/*
 @author Zakai Hamilton
 @component GoogleAuth
 */

package.lib.googleauth = function GoogleAuth(me) {
    me.init = function (task) {
        me.core.property.link("core.http.headers", "lib.googleauth.headers", true);
        me.lock(task, (task) => {
            me.core.require(() => {
                gapi.load('auth2', function () {
                    // Retrieve the singleton for the GoogleAuth library and set up the client.
                    me.auth2 = gapi.auth2.init({
                        client_id: '635502370539-auglpog2b0bc2i6diq128ionuhvd6u3g.apps.googleusercontent.com'
                    });
                    me.auth2.isSignedIn.listen(me.signInChanged);
                    me.auth2.currentUser.listen(me.userChanged);
                    if (me.auth2.isSignedIn.get() === true) {
                        me.log("googleauth:" + "signing in");
                        me.auth2.signIn();
                    }
                    me.unlock(task);
                });
            }, ["https://apis.google.com/js/api:client.js"]);
        });
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
        var window = me.widget.window(object);
        // Useful data for your client-side scripts:
        var profile = googleUser.getBasicProfile();
        me.log("ID: " + profile.getId()); // Don't send this directly to your server!
        me.log('Full Name: ' + profile.getName());
        me.log('Given Name: ' + profile.getGivenName());
        me.log('Family Name: ' + profile.getFamilyName());
        me.log("Image URL: " + profile.getImageUrl());
        me.log("Email: " + profile.getEmail());

        // The ID token you need to pass to your backend:
        var id_token = googleUser.getAuthResponse().id_token;
        me.log("ID Token: " + id_token);

        if (callback) {
            callback();
        }
    };
    me.token = function() {
        var token = null;
        if(me.isSignedIn()) {
            var user = me.currentUser();
            token = user.getAuthResponse().id_token
        }
        return token;
    };
    me.signout = {
        set: function (object) {
            me.auth2.signOut().then(function () {
                me.log('User signed out.');
            });
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
        return me.auth2.isSignedIn.get();
    };
    me.signInChanged = function (state) {
        me.log('Signin state changed to ', state);
    };
    me.userChanged = function (user) {
        me.log('User now: ', user);
    };
    me.headers = function(info) {
        var token = me.token();
        if(token) {
            info.headers["user_id"] = token;
        }
    };
};
