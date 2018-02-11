/*
 @author Zakai Hamilton
 @component CoreNetwork
 */

package.require("core.network", "server");

package.core.network = function CoreNetwork(me) {
    me.ipAddress = function(callback) {
        var ip = null;
        if(this && this.clientIp) {
            ip = this.clientIp;
        }
        callback(ip);
    };
};
