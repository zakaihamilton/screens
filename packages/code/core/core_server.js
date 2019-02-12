/*
    @author Zakai Hamilton
    @component CoreServer
*/

screens.core.server = function CoreServer(me) {
    me.init = function () {
        me.cmd = require("node-cmd");
        me.startDate = new Date();
    };
    me.run = async function (cmd) {
        me.log("running: " + cmd);
        return new Promise((resolve, reject) => {
            me.cmd.get(cmd, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    };
    me.memoryUsage = function () {
        return process.memoryUsage();
    };
    me.date = function () {
        return me.startDate.toString();
    };
    me.upgrade = async function () {
        var remoteServer = me.core.util.isSecure();
        await me.run("git checkout package.json");
        await me.run("git pull");
        await me.run("npm install");
        if (remoteServer) {
            await me.run("pm2 reload all");
        }
    };
    return "server";
};
