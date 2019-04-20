/*
    @author Zakai Hamilton
    @component CmdState
*/

screens.cmd.state = function CmdState(me, packages) {
    const { core, db } = packages;
    me.cmd = async function (terminal, args) {
        var items = await db.events.state.list();
        if (items) {
            for (let item of items) {
                core.property.set(terminal, "print", JSON.stringify(item));
            }
        }
        core.cmd.exit(terminal);
    };
};
