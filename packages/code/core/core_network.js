/*
 @author Zakai Hamilton
 @component CoreNetwork
 */

package.core.network = function CoreNetwork(me) {
    me.ipAddress = function(callback) {
        var ip = null;
        if(this && this.clientIp) {
            ip = this.clientIp;
        }
        callback(ip);
    };
    me.isOnline = function() {
        return navigator.onLine;
    };
    me.online = {
        set: function (object, value) {
            me.core.event.register(null, object, "online", value, "online", window);
        }
    };
    me.offline = {
        set: function (object, value) {
            me.core.event.register(null, object, "offline", value, "offline", window);
        }
    };
    return "server";
};
