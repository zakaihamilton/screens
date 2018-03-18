/*
 @author Zakai Hamilton
 @component AppTerminal
 */

package.app.terminal = function AppTerminal(me) {
    me.launch = function () {
        me.singleton = me.ui.element(__json__);
        return me.singleton;
    };
    me.response = {
        set: function(object, value) {
            me.core.cmd.handle(object, value);
        }
    };
};
