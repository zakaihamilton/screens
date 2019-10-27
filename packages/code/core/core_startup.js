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
        await core.broadcast.send("prepare");
        await core.broadcast.send("startup");
    };
};
