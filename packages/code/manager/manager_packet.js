/*
 @author Zakai Hamilton
 @component ManagerPacket
 */

screens.manager.packet = function ManagerPacket(me) {
    me.packetInfo = {
        streamRequests: [],
        effects: {},
        streamIndex: 0,
        runIndex: 0
    };
    me.init = function () {
        me.core.property.link("core.service.ready", "manager.packet.ready", true);
    };
    me.push = function (packets) {
        var info = me.packetInfo;
        if (!Array.isArray(packets)) {
            packets = [packets];
        }
        me.log("received " + packets.length + " packets");
        for (var packet of packets) {
            if (packet.streamIndex !== me.packetInfo.streamIndex || !info.streamRequests.length) {
                info.streamRequests.push({
                    packetCount: 0,
                    dataSize: 0,
                    startTime: 0,
                    duration: 0,
                    runIndex: packet.runIndex,
                    streamIndex: packet.streamIndex,
                    packets: {},
                    effects: packet.effects,
                    searchMatch: packet.match
                });
                me.packetInfo.effects = packet.effects;
                me.packetInfo.runIndex = packet.runIndex;
                me.packetInfo.streamIndex = packet.streamIndex;
            }
            var streamRequest = info.streamRequests[info.streamRequests.length - 1];
            streamRequest.packetCount+=packet.count;
            var packet_source = packet.source;
            var packet_target = packet.target;
            streamRequest.dataSize += packet.size;
            if(packet.match) {
                streamRequest.searchMatch = packet.match;
            }
            if (!streamRequest.startTime) {
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
                    item = items[key] = { len: 0, start: packet.time, end: 0 };
                }
                item.len += packet.size;
                item.end = packet.time;
            }
        }
    };
    me.info = function () {
        return me.packetInfo;
    };
    me.reset = async function () {
        me.packetInfo = {
            streamRequests: [],
            effects: {},
            runIndex: 0,
            streamIndex: 0
        };
        await me.core.service.sendAll("service.netmonitor.reset");
        await me.core.service.sendAll("service.netcontrol.reset");
        var effects = await me.retrieveEffects();
        resolve(effects);
    };
    me.ready = {
        set: async function () {
            await me.retrieveEffects();
        }
    };
    me.retrieveEffects = async function () {
        var response = await me.core.service.sendAll("service.netcontrol.retrieveEffects");
        if (response) {
            var effects = response[0];
            if (!effects) {
                effects = {};
            }
            me.log("recieved effects: " + JSON.stringify(effects));
            me.packetInfo.effects = effects;
            return effects;
        }
    };
    me.applyEffects = async function (params) {
        me.packetInfo.effects = Object.assign({}, me.packetInfo.effects, params);
        me.log("applying packet effects: " + JSON.stringify(me.packetInfo.effects));
        await me.core.service.sendAll("service.netcontrol.applyEffects", me.packetInfo.effects);
    };
    me.getMonitorOptions = async function() {
        var response = await me.core.service.sendAll("service.netmonitor.getOptions");
        if (response) {
            var options = response[0];
            return options;
        }
    };
    me.setMonitorOptions = async function (options) {
        await me.core.service.sendAll("service.netmonitor.setOptions", options);
    };
    return "server";
};
