/*
    @author Zakai Hamilton
    @component CmdMem
*/

screens.cmd.mem = function CmdMem(me) {
    me.cmd = async function(terminal, args) {
        const memoryUsage = await me.core.server.memoryUsage();
        const used = memoryUsage.heapUsed / 1024 / 1024;
        me.core.property.set(terminal, "print", `The server uses approximately ${used} MB`);
        me.core.cmd.exit(terminal);
    };
};
