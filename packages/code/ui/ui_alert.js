/*
 @author Zakai Hamilton
 @component UIAlert
 */

screens.ui.alert = function UIAlert(me) {
    me.proxy.apply = function(message) {
        alert(message);
    };
};
