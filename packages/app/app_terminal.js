/*
 @author Zakai Hamilton
 @component AppTerminal
 */

package.app.terminal = function AppTerminal(me) {
    me.require = {platform: "browser"};
    me.launch = function () {
        me.ui.element.create(__json__);
    };
    me.response = {
        set: function(object, value) {
            me.core.cmd.handle(object, value);
        }
    };
};
