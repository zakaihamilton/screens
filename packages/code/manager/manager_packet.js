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
    me.push = function (callback, packet, service) {
        var info = me.packetInfo;
        info.packetCount++;
        var dataSize = me.core.json.traverse(packet, "payload.payload.payload.dataLength").value;
        if (dataSize) {
            info.dataSize += dataSize;
        }
        var packet_sec = me.core.json.traverse(packet, "pcap_header.tv_sec").value;
        var packet_len = me.core.json.traverse(packet, "pcap_header.len").value;
        var packet_source = me.core.json.traverse(packet, "payload.payload.saddr.addr").value;
        var packet_target = me.core.json.traverse(packet, "payload.payload.daddr.addr").value;
        if (packet_source && packet_target) {
            packet_source = packet_source.join(".");
            packet_target = packet_target.join(".");
            var sourceMap = info.packets[packet_source];
            if (!sourceMap) {
                sourceMap = info.packets[packet_source] = {};
            }
            var targetMap = sourceMap[packet_target];
            if (!targetMap) {
                targetMap = sourceMap[packet_target] = {};
            }
            if (this && this.clientIp) {
                if (this.clientIp.includes(packet_source)) {
                    targetMap.sourceIsService = true;
                }
                if (this.clientIp.includes(packet_target)) {
                    targetMap.targetIsService = true;
                }
            }
            var items = targetMap.items;
            if (!targetMap.items) {
                items = targetMap.items = {};
            }
            var key = parseInt(packet_sec / 5);
            var item = items[key];
            if (!item) {
                item = items[key] = {len: 0, start: packet_sec, end: 0};
            }
            item.len += packet_len;
            item.end = packet_sec;
        }
        callback();
    };
    me.info = function (callback) {
        callback(me.packetInfo);
    };
    me.reset = function (callback) {
        me.packetInfo = {packetCount: 0, dataSize: 0, packets: {}};
        callback();
    };
    me.setPacketLoss = function (callback, packetLoss) {
        var errors = null;
        var count = me.core.service.sendAll("service.netcontrol.setPacketLoss", (err) => {
            if (err) {
                if (!errors) {
                    errors = [];
                }
                errors.push(err);
            }
            count--;
            console.log("recieved from a device, " + count + " devices left");
            if (!count) {
                if (errors) {
                    me.core.console.error("errors: " + errors);
                }
                callback.apply(null, errors);
            }
        }, packetLoss);
        console.log("sent to " + count + " devices");
    };
};
