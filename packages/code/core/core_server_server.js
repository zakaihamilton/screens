/*
    @author Zakai Hamilton
    @component CoreServer
*/

screens.core.server = function CoreServer(me) {
    me.init = function () {
        me.cmd = require("node-cmd");
        me.child_process = require("child_process");
        me.startDate = new Date();
    };
    me.spawn = async function (cmd) {
        return new Promise((resolve, reject) => {
            me.log("spawning: " + cmd);
            me.child_process.exec(cmd, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
                if (error) {
                    me.log("error " + error + " returned on process: " + cmd);
                    reject(stderr);
                }
                else {
                    resolve(stdout);
                }
            });
        });
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
        await me.run("git checkout package.json");
        await me.run("git pull");
        await me.run("npm install");
    };
    return "server";
};
