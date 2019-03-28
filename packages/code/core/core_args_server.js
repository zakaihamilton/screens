/*
 @author Zakai Hamilton
 @component CoreArgs
 */

screens.core.args = function CoreArgs(me, packages) {
    me.value = function (name) {
        let value = undefined;
        for (let arg of process.argv) {
            const [argName, argValue] = arg.split("=");
            if (argName !== name) {
                continue;
            }
            if (arg.includes("=")) {
                value = argValue;
            }
            else {
                value = true;
            }
        }
        return value;
    };
};