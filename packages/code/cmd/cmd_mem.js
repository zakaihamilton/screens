/*
    @author Zakai Hamilton
    @component CmdMem
*/

screens.cmd.mem = function CmdMem(me) {
    me.cmd = async function(terminal, args) {
        const memoryUsage = await me.core.server.memoryUsage();
        const used = parseInt(memoryUsage.heapUsed / 1024 / 1024);
        me.core.property.set(terminal, "print", `The server uses approximately ${used} MB`);
        for(param in memoryUsage) {
            me.core.property.set(terminal, "print", param + ": " + memoryUsage[param]);
        }
        me.core.cmd.exit(terminal);
    };
};
