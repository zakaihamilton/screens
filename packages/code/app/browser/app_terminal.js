/*
 @author Zakai Hamilton
 @component AppTerminal
 */

screens.app.terminal = function AppTerminal(me, packages) {
    me.launch = function () {
        me.singleton = me.ui.element.create(me.json);
        return me.singleton;
    };
    me.response = {
        set: function (object, value) {
            me.core.cmd.handle(object, value);
        }
    };
};
