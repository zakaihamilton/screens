/*
    @author Zakai Hamilton
    @component CmdLs
*/

screens.cmd.ls = function CmdLs(me) {
    me.cmd = async function (terminal, args) {
        var current_dir = terminal.current_dir;
        if (!current_dir) {
            current_dir = ".";
        }
        var items = await me.core.file.readDir(current_dir);
        if (items) {
            for (let item of items) {
                me.core.property.set(terminal, "print", item);
            }
        }
        me.core.cmd.exit(terminal);
    };
};
