/*
    @author Zakai Hamilton
    @component CmdExit
*/

screens.cmd.exit = function CmdExit(me, packages) {
    me.cmd = function (terminal, args) {
        var window = me.widget.window.get(terminal);
        me.core.property.set(window, "close");
        me.core.cmd.exit(terminal);
    };
};
