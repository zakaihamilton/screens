/*
 @author Zakai Hamilton
 @component UIExec
 */

package.ui.exec = function UIExec(me) {
    me.forward = function (object, property) {
        return {
            set: function (object, value) {
                document.designMode = "on";
                document.execCommand(property, false, null);
                document.designMode = "off";
            }
        };
    };
};
