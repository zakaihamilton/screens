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
            };
            me.core.require.require(() => {
                me.unlock(task);
            }, ["https://connect.facebook.net/en_US/sdk.js"]);
        });
    };
    me.status = function (callback) {
        FB.getLoginStatus(function (response) {
            callback(response);
        });
    };
};
