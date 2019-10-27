/*
    @author Zakai Hamilton
    @component CoreCmd
*/

screens.core.cmd = function CoreCmd(me, { core }) {
    me.application = function (terminal) {
        return terminal.application;
    };
    me.handle = async function (terminal, args) {
        if (!Array.isArray(args)) {
            args = core.string.split(args);
        }
        if (!args.length) {
            me.exit(terminal);
            return;
        }
        if (terminal.application) {
            core.message.send(terminal.application + ".response", terminal, terminal.handle, args);
            return;
        }
        var application = "cmd." + args[0];
        try {
            await screens.include(application);
            terminal.application = application;
            terminal.handle = await core.message.send(application + ".cmd", terminal, args);
        }
        catch (err) {
            core.property.set(terminal, "print", "Unknown command");
            me.exit(terminal);
        }
    };
    me.exit = function (terminal) {
        terminal.application = null;
        core.property.set(terminal, "input", "C>");
    };
};
