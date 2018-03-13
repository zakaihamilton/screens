/*
 @author Zakai Hamilton
 @component ManagerPacket
 */

package.require("manager.packet", "server");

package.manager.packet = function ManagerPacket(me) {
    me.packetInfo = {
        streamRequests:[],
        effects:{},
        runIndex:0
    };
    me.init = function() {
        me.core.property.link("core.service.ready", "manager.packet.ready", true);
    };
    me.push = function (callback, packets, service) {
        var info = me.packetInfo;
        if(!Array.isArray(packets)) {
            packets = [packets];
        }
        me.core.console.log("received " + packets.length + " packets");
        for(var packet of packets) {
            if(packet.runIndex !== me.packetInfo.runIndex || !info.streamRequests.length) {
                info.streamRequests.push({
                    packetCount: 0,
                    dataSize: 0,
                    startTime: 0,
                    duration: 0,
                    runIndex:packet.runIndex,
                    packets: {},
                    effects: packet.effects
                });
                me.packetInfo.effects = packet.effects;
                me.packetInfo.runIndex = packet.runIndex;
            }
            var streamRequest = info.streamRequests[info.streamRequests.length-1];
            streamRequest.packetCount++;
            var packet_source = packet.source;
            var packet_target = packet.target;
            streamRequest.dataSize += packet.size;
            if(!streamRequest.startTime) {
                streamRequest.startTime = packet.time;
            }
            streamRequest.duration = packet.time - streamRequest.startTime;
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
                var key = parseInt(packet.time / 10);
                var item = items[key];
                if (!item) {
                    item = items[key] = {len: 0, start: packet.time, end: 0};
                }
                item.len += packet.size;
                item.end = packet.time;
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
            effects:{},
            runIndex:0
        };
        me.core.service.sendAll("service.netmonitor.reset", () => {
            me.core.service.sendAll("service.netcontrol.reset", () => {
                me.retrieveEffects(callback);
            });
        });
    };
    me.ready = {
        set: function() {
            me.retrieveEffects(() => {
                
            });
        }
    };
    me.retrieveEffects = function (callback) {
        me.core.service.sendAll("service.netcontrol.retrieveEffects", (response) => {
            if(response) {
                var effects = response[0];
                if(!effects) {
                    effects = {};
                }
                me.core.console.log("recieved effects: " + JSON.stringify(effects));
                me.packetInfo.effects = effects;
                callback(effects);
            }
        });
    };
    me.applyEffects = function (callback, params) {
        me.packetInfo.effects = Object.assign({}, me.packetInfo.effects, params);
        me.core.console.log("applying packet effects: " + JSON.stringify(me.packetInfo.effects));
        me.core.service.sendAll("service.netcontrol.applyEffects", (response) => {
            var error = response[0];
            callback(error);
        }, me.packetInfo.effects);
    };
    me.enablePush = function(callback, flag) {
        me.core.service.sendAll("service.netmonitor.enablePush", (response) => {
            var error = response[0];
            callback(error);
        }, flag);
    };
    me.isPushEnabled = function(callback) {
        me.core.service.sendAll("service.netmonitor.isPushEnabled", (response) => {
            if(response) {
                var isPushEnabled = response[0];
                callback(isPushEnabled);
            }
        });
    };
};
