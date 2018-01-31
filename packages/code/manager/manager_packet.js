/*
 @author Zakai Hamilton
 @component ManagerPacket
 */

package.require("manager.packet", "server");

package.manager.packet = function ManagerPacket(me) {
    me.init = function () {
        me.list = [];
    };
    me.push = function(callback, packet, service) {
        me.list.push({service:service,packet:packet});
        me.core.console.log("accumalated " + me.list.length + " packets");
    };
    me.removeall = function(callback) {
        me.list = [];
        callback();
    };
    me.items = function(callback) {
        callback(me.list);
    };
};
