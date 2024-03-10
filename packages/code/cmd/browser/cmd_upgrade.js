/*
    @author Zakai Hamilton
    @component CmdUpgrade
*/

screens.cmd.upgrade = function CmdUpgrade(me, { core }) {
    me.cmd = async function (terminal) {
        try {
            var data = await core.server.upgrade();
            core.property.set(terminal, "print", data);
        }
        catch (err) {
            let error = err;
            if (typeof error !== "string") {
                error = JSON.stringify(err);
            }
            core.property.set(terminal, "print", error);
        }
        core.cmd.exit(terminal);
    };
};
