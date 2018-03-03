/*
 @author Zakai Hamilton
 @component FacebookAuth
 */

package.lib.facebookauth = function FacebookAuth(me) {
    me.init = function (task) {
        me.lock(task, (task) => {
            window.fbAsyncInit = function () {
                FB.init({
                    appId: '369496103524718',
                    cookie: true,
                    xfbml: true,
                    version: 'v2.12'
                });
                FB.AppEvents.logPageView();
                me.unlock(task);
            };
            me.core.require.require(() => {
            }, ["https://connect.facebook.net/en_US/sdk.js"]);
        });
    };
    me.status = function (callback) {
        FB.getLoginStatus(function (response) {
            if(response.status === "connected") {
                FB.api('/' + response.userID, function(profile) {
                    response.profile = profile;
                    callback(response);
                });
            }
            else {
                callback(response);
            }
        });
    };
};
