/*
    @author Zakai Hamilton
    @component CmdMem
*/

screens.cmd.mem = function CmdMem(me, packages) {
    const { core } = packages;
    me.cmd = async function (terminal, args) {
        const memoryUsage = await core.server.memoryUsage();
        const used = parseInt(memoryUsage.heapUsed / 1024 / 1024);
        core.property.set(terminal, "print", `The server uses approximately ${used} MB`);
        for (let param in memoryUsage) {
            core.property.set(terminal, "print", param + ": " + memoryUsage[param]);
        }
        core.cmd.exit(terminal);
    };
};
