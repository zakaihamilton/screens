/*
 @author Zakai Hamilton
 @component AppTerminal
 */

package.app.terminal = function AppTerminal(me) {
    me.launch = function () {
        me.package.ui.element.create(__json__);
    };
    me.response = {
        set: function(object, value) {
            me.package.core.cmd.handle(object, value);
        }
    };
};
