/*
 @author Zakai Hamilton
 @component CmdVersion
 */

screens.cmd.version = function CmdVersion(me, packages) {
    const { core } = packages;
    me.cmd = async function (terminal, args) {
        var json = await core.json.loadFile("/package.json");
        core.property.set(terminal, "print", json.version);
        core.cmd.exit(terminal);
    };
};
