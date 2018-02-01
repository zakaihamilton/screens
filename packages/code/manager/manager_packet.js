/*
 @author Zakai Hamilton
 @component ManagerPacket
 */

package.require("manager.packet", "server");

package.manager.packet = function ManagerPacket(me) {
    me.init = function () {
        me.reset(() => {
            
        });
    };
    me.push = function(callback, packet, service) {
        var info = me.packetInfo;
        info.packetCount++;
        var dataSize = me.core.json.traverse(packet, "payload.payload.payload.dataLength").value;
        if(dataSize) {
            info.dataSize+=dataSize;
        }
    };
    me.info = function(callback) {
        callback(me.packetInfo);
    };
    me.reset = function(callback) {
        me.packetInfo = {packetCount:0, dataSize:0};
        callback();
    };
    me.setPacketLoss = function(callback, packetLoss) {
        me.core.service.sendAll("service.netcontrol.setPacketLoss", () => {
            callback();
        }, packetLoss);
    };
};
