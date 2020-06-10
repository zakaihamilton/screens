/*
    @author Zakai Hamilton
    @component CmdLs
*/

screens.cmd.ls = function CmdLs(me, { core }) {
    me.cmd = async function (terminal) {
        var current_dir = terminal.current_dir;
        if (!current_dir) {
            current_dir = ".";
        }
        var items = await core.file.readDir(current_dir);
        if (items) {
            for (let item of items) {
                core.property.set(terminal, "print", item);
            }
        }
        core.cmd.exit(terminal);
    };
};
