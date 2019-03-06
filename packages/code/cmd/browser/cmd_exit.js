/*
    @author Zakai Hamilton
    @component CmdExit
*/

screens.cmd.exit = function CmdExit(me, packages) {
    const { core } = packages;
    me.cmd = function (terminal, args) {
        var window = me.widget.window.get(terminal);
        core.property.set(window, "close");
        core.cmd.exit(terminal);
    };
};
