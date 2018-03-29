/*
 @author Zakai Hamilton
 @component AppLauncher
 */

screens.app.launcher = function AppLauncher(me) {
    me.launch = function (args) {
        return me.ui.element(__json__, "workspace", "self");
    };
};
