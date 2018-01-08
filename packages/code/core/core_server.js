/*
    @author Zakai Hamilton
    @component CoreServer
*/

package.require("core.server", "server");
package.core.server = function CoreServer(me) {
    me.init = function() {
        me.cmd=require('node-cmd');
    };
    me.run = function(callback, cmd) {
        me.cmd.get(cmd, callback);
    };
};
