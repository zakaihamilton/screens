/*
 @author Zakai Hamilton
 @component UIExec
 */

screens.ui.exec = function UIExec(me) {
    me.proxy.get = function (object, property) {
        return {
            set: function (object, value) {
                document.designMode = "on";
                document.execCommand(property, false, null);
                document.designMode = "off";
            }
        };
    };
};
