/*
    @author Zakai Hamilton
    @component CmdExit
*/

screens.cmd.exit = function CmdExit(me, { core }) {
    me.cmd = function (terminal, args) {
        var window = widget.window.get(terminal);
        core.property.set(window, "close");
        core.cmd.exit(terminal);
    };
};
