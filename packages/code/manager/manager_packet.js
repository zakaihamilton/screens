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
    me.signal = function(callback, path) {
        me.packetInfo.signal = true;
        if(me.packetInfo.effects.autoIncreasePacketDelay) {
            var packetDelay = parseInt(me.packetInfo.effects.packetDelay);
            if(!packetDelay) {
                packetDelay = 0;
            }
            var effects = {
                "packetDelay" : packetDelay + 5
            };
            me.affect(callback, effects);
        }
        else {
            callback();
        }
    };
    me.push = function (callback, packets, service) {
        var info = me.packetInfo;
        if(info.signal || !info.streamRequests.length) {
            info.signal = false;
            info.streamRequests.push({
                packetCount: 0,
                dataSize: 0,
                startTime: 0,
                duration: 0,
                packets: {}
            });
        }
        if(!Array.isArray(packets)) {
            packets = [packets];
        }
        me.core.console.log("received " + packets.length + " packets");
        for(var packet of packets) {
            var streamRequest = info.streamRequests[info.streamRequests.length-1];
            streamRequest.effects = Object.assign({}, info.effects);
            streamRequest.packetCount++;
            var packet_sec = packet.time;
            var packet_len = packet.size;
            var packet_source = packet.source;
            var packet_target = packet.target;
            streamRequest.dataSize += packet_len;
            if(!streamRequest.startTime) {
                streamRequest.startTime = packet_sec;
            }
            streamRequest.duration = packet_sec - streamRequest.startTime;
            if (packet_source && packet_target) {
                packet_source = packet_source.join(".");
                packet_target = packet_target.join(".");
                var sourceMap = streamRequest.packets[packet_source];
                if (!sourceMap) {
                    sourceMap = streamRequest.packets[packet_source] = {};
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
                var key = parseInt(packet_sec / 10);
                var item = items[key];
                if (!item) {
                    item = items[key] = {len: 0, start: packet_sec, end: 0};
                }
                item.len += packet_len;
                item.end = packet_sec;
            }
        }
        callback();
    };
    me.info = function (callback) {
        callback(me.packetInfo);
    };
    me.reset = function (callback) {
        me.packetInfo = {
            streamRequests:[],
            signal:false,
            effects:{
                autoIncreasePacketDelay:true
            }
        };
        callback();
    };
    me.affect = function (callback, params) {
        me.packetInfo.effects = Object.assign({}, me.packetInfo.effects, params);
        me.core.console.log("applying packet effects: " + JSON.stringify(me.packetInfo.effects));
        me.core.service.sendAll("service.netcontrol.affect", callback, me.packetInfo.effects);
    };
};
