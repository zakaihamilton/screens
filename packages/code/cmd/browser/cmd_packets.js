/*
    @author Zakai Hamilton
    @component CmdPackets
*/

screens.cmd.packets = function CmdPackets(me, packages) {
    const { core } = packages;
    me.cmd = async function (terminal, args) {
        var effects = await me.manager.packet.retrieveEffects();
        if (!effects) {
            effects = {};
        }
        core.property.set(terminal, "print", "Packets effects: " + Object.keys(effects).length);
        if (args.length > 2) {
            var key = args[1];
            var value = args[2];
            effects[key] = value;
            await me.manager.packet.applyEffects(effects);
        }
        for (var key in effects) {
            core.property.set(terminal, "print", key + "=" + effects[key]);
        }
        core.cmd.exit(terminal);
    };
};
