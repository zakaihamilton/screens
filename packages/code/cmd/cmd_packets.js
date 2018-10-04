/*
    @author Zakai Hamilton
    @component CmdPackets
*/

screens.cmd.packets = function CmdPackets(me) {
    me.cmd = async function(terminal, args) {
        var effects = await me.manager.packet.retrieveEffects();
        if(!effects) {
            effects = {};
        }
        me.core.property.set(terminal, "print", "Packets effects: " + Object.keys(effects).length);
        if(args.length > 2) {
            var key = args[1];
            var value = args[2];
            effects[key] = value;
            await me.manager.packet.applyEffects(effects);
        }
        for(var key in effects) {
            me.core.property.set(terminal, "print", key + "=" + effects[key]);
        }
        me.core.cmd.exit(terminal);
    };
};
