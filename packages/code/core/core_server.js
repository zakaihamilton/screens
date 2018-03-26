/*
    @author Zakai Hamilton
    @component CoreServer
*/

package.core.server = function CoreServer(me) {
    me.init = function() {
        me.cmd=require('node-cmd');
    };
    me.run = function(callback, cmd) {
        me.log("running: " + cmd);
        me.cmd.get(cmd, callback);
    };
    return "server";
};
