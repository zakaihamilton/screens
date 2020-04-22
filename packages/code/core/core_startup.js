/*
 @author Zakai Hamilton
 @component CoreStartup
 */

screens.core.startup = function CoreStartup(me, { core }) {
    me.app = {
        name: "",
        params: null
    };
    me.run = async function () {
        await Promise.all(core.broadcast.send("prepare"));
        await Promise.all(core.broadcast.send("startup"));
    };
};
