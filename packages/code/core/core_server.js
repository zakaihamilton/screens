/*
    @author Zakai Hamilton
    @component CoreServer
*/

screens.core.server = function CoreServer(me) {
    me.init = function() {
        me.cmd=require('node-cmd');
    };
    me.run = async function(cmd) {
        me.log("running: " + cmd);
        return new Promise((resolve, reject) => {
            me.cmd.get(cmd, (err, data, stderr) => {
                if(err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    };
    return "server";
};
