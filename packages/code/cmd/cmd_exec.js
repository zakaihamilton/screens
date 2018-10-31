/*
    @author Zakai Hamilton
    @component CmdExec
*/

screens.cmd.exec = function CmdExec(me) {
    me.cmd = async function (terminal, args) {
        if (args.length <= 1) {
            me.core.cmd.exit(terminal);
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
            me.core.property.set(terminal, "print", JSON.stringify(result));
        }
        catch (err) {
            var string = err;
            if(typeof string === "object") {
                string = JSON.stringify(string);
            }
            me.core.property.set(terminal, "print", "exec: " + args[1] + ", error:" + string);
        }
        me.core.cmd.exit(terminal);
    };
};
