/*
 @author Zakai Hamilton
 @component AppLibrary
 */

screens.app.library = function AppLibrary(me) {
    me.launch = function (args) {
        return me.ui.element(__json__, "workspace", "self");
    };
};
