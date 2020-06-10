/*
    @author Zakai Hamilton
    @component CmdReset
*/

screens.cmd.reset = function CmdReset(me, { core }) {
    me.cmd = async function (terminal) {
        let result = await core.message.service_worker.unregister();
        core.property.set(terminal, "print", result ? "Service worker unregistered" : "Service worker failed to unregister");
        core.cmd.exit(terminal);
    };
};
