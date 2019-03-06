/*
 @author Zakai Hamilton
 @component CmdVersion
 */

screens.cmd.version = function CmdVersion(me, packages) {
    me.cmd = async function (terminal, args) {
        var json = await me.core.json.loadFile("/package.json");
        me.core.property.set(terminal, "print", json.version);
        me.core.cmd.exit(terminal);
    };
};
