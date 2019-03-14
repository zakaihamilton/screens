/*
    @author Zakai Hamilton
    @component CmdExec
*/

screens.cmd.exec = function CmdExec(me, packages) {
    const { core } = packages;
    me.cmd = async function (terminal, args) {
        if (args.length <= 1) {
            core.cmd.exit(terminal);
            return;
        }
        var result = null;
        try {
            var method = screens.browse(args[1]);
            if (typeof method === "function") {
                result = await method.apply(null, args.slice(2));
            }
            else {
                result = method;
            }
            if (typeof result === "object") {
                result = JSON.stringify(result, null, 4);
            }
            else {
                result = String(result);
            }
            core.property.set(terminal, "print", result);
        }
        catch (err) {
            var string = err;
            if (string && string.message) {
                string = string.message + " stack: " + string.stack;
            }
            else if (typeof string === "object") {
                string = JSON.stringify(string);
            }
            core.property.set(terminal, "print", "exec: " + args[1] + ", error:" + string);
        }
        core.cmd.exit(terminal);
    };
};
