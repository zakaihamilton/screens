/*
 @author Zakai Hamilton
 @component AppUsers
 */

screens.app.users = function AppUsers(me) {
    me.launch = function () {
        return me.ui.element(__json__, "workspace", "self");
    };
};