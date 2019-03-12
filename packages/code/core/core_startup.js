/*
 @author Zakai Hamilton
 @component CoreStartup
 */

screens.core.startup = function CoreStartup(me, packages) {
    const { core } = packages;
    me.app = {
        name: "",
        params: null
    };
    me.run = async function () {
        await core.broadcast.send("prepare");
        await core.broadcast.send("startup");
    };
};
