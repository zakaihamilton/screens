/*
 @author Zakai Hamilton
 @component GoogleAuth
 */

package.lib.googleauth = function GoogleAuth(me) {
    me.init = function (task) {
        me.lock(task, (task) => {
            me.core.require.require(() => {
                gapi.load('auth2', function () {
                    // Retrieve the singleton for the GoogleAuth library and set up the client.
                    me.auth2 = gapi.auth2.init({
                        client_id: '635502370539-auglpog2b0bc2i6diq128ionuhvd6u3g.apps.googleusercontent.com'
                    });
                    me.auth2.isSignedIn.listen(me.signInChanged);
                    me.auth2.currentUser.listen(me.userChanged);
                    if (me.auth2.isSignedIn.get() === true) {
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
        var window = me.widget.window.window(object);
        // Useful data for your client-side scripts:
        var profile = googleUser.getBasicProfile();
        console.log("ID: " + profile.getId()); // Don't send this directly to your server!
        console.log('Full Name: ' + profile.getName());
        console.log('Given Name: ' + profile.getGivenName());
        console.log('Family Name: ' + profile.getFamilyName());
        console.log("Image URL: " + profile.getImageUrl());
        console.log("Email: " + profile.getEmail());

        // The ID token you need to pass to your backend:
        var id_token = googleUser.getAuthResponse().id_token;
        console.log("ID Token: " + id_token);

        window.var.name.innerText = "Signed in: " + googleUser.getBasicProfile().getName();
        if (callback) {
            callback();
        }
    };
    me.signout = {
        set: function (object) {
            me.auth2.signOut().then(function () {
                console.log('User signed out.');
            });
        }
    };
    me.attachSignIn = {
        set: function (object, value) {
            me.auth2.attachClickHandler(object, {}, (googleUser) => {
                me.signin(value, object, googleUser);
            }, me.core.console.error);
        }
    };
    me.isSignedIn = function() {
        return me.auth2.isSignedIn.get();
    };
    me.signInChanged = function (state) {
        console.log('Signin state changed to ', state);
    };
    me.userChanged = function (user) {
        console.log('User now: ', user);
    };
};
