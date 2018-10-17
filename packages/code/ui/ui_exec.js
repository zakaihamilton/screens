/*
 @author Zakai Hamilton
 @component UIExec
 */

screens.ui.exec = function UIExec(me) {
    me.proxy.get = function () {
        return {
            set: function (object, value, property) {
                document.designMode = "on";
                document.execCommand(property, false, null);
                document.designMode = "off";
            }
        };
    };
};
