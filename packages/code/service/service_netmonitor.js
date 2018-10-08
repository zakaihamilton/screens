/*
 @author Zakai Hamilton
 @component ServiceNetMonitor
 @prerequisites npm install pcap2
 */

screens.service.netmonitor = function ServiceNetMonitor(me) {
    me.setup = async function () {
        me.device = null;
        me.packets = [];
        me.timer = null;
        me.runIndex = 0;
        me.streamIndex = 0;
        me.options = {
            pushPackets: true,
            combinePackets: true,
            collectPackets: false,
            filterNode: ""
        };
        me.statistics = {};
        me.config = await me.core.service.config(me.id);
        if (me.config) {
            me.reload();
            setInterval(async () => {
                me.log("monitor options: " + JSON.stringify(me.options));
                me.log("monitor statistics: " + JSON.stringify(me.statistics));
                if (!me.options.pushPackets) {
                    return;
                }
                var packets = me.packets;
                if (!packets || !packets.length) {
                    return;
                }
                me.packets = [];
                me.log("there are " + packets.length + " packets in queue");
                if (me.options.combinePackets) {
                    packets = me.combinePackets(packets);
                    me.log("combined into " + packets.length + " packets");
                }
                await me.manager.packet.push(packets);
                me.log("sent " + packets.length + " packets to server");
                me.packets = [];
            }, parseInt(me.config.delay));
        }
    };
    me.reload = async function () {
        var config = me.config;
        me.pcap = require('pcap2');
        me.tracker = new me.pcap.TCPTracker();
        me.util = require('util');
        var devices = config.device;
        if (devices && !Array.isArray(devices)) {
            devices = [devices];
        }
        var filter = config.filter;
        if(me.options.filterNode) {
            filter = me.options.filterNode;
        }
        if (filter) {
            filter = filter.replace("@port", me.core.http.port);
            me.log("using filter: " + filter);
        }
        for (var device of devices) {
            me.session = null;
            try {
                me.session = new me.pcap.Session(device, { filter });
            } catch (e) {
                me.error("Cannot create pcap session for device: " + device + " filter: " + filter);
            }
            if (me.session) {
                me.log("connected through device: " + device + " filter: " + filter);
                me.device = device;
                break;
            }
        }
        if (me.session) {
            me.session.on('packet', function (rawPacket) {
                if (!me.options.collectPackets) {
                    return;
                }
                var fullPacket = me.pcap.decode.packet(rawPacket);
                if (filter && filter.includes("tcp")) {
                    me.tracker.track_packet(fullPacket);
                }
                var fullPacket = JSON.parse(JSON.stringify(fullPacket));
                var packet_sec = me.core.json.traverse(fullPacket, "pcap_header.tv_sec").value;
                var packet_len = me.core.json.traverse(fullPacket, "pcap_header.len").value;
                var packet_source = me.core.json.traverse(fullPacket, "payload.payload.saddr.addr").value;
                var packet_target = me.core.json.traverse(fullPacket, "payload.payload.daddr.addr").value;
                var effects = {};
                var netcontrol = me.service.netcontrol;
                if (netcontrol) {
                    var effects = netcontrol.effects;
                }
                var packet = {
                    source: packet_source,
                    target: packet_target,
                    size: packet_len,
                    time: packet_sec,
                    runIndex: me.runIndex,
                    streamIndex: me.streamIndex,
                    effects: effects
                };
                me.packets.push(packet);
            });
            if (filter && filter.includes("tcp")) {
                me.tracker.on('start', function (session) {
                    me.log("Start of TCP session between " + session.src_name + " and " + session.dst_name);
                });
                me.tracker.on('end', function (session) {
                    me.log("End of TCP session between " + session.src_name + " and " + session.dst_name);
                });
            }
        } else {
            me.log("cannot connect through any of the following devices: " + devices);
        }
    };
    me.combinePackets = function (packets) {
        var sources = {};
        for (var packet of packets) {
            var source = sources[packet.source];
            if (!source) {
                source = sources[packet.source] = {};
            }
            var target = source[packet.target];
            if (!target) {
                target = source[packet.target] = [];
            }
            target.push(packet);
        }
        var combinedPackets = [];
        for (const source of Object.values(sources)) {
            for (const target of Object.values(source)) {
                var first = true;
                var combinedPacket = {};
                for (var packet of target) {
                    if (first) {
                        combinedPacket = packet;
                        first = false;
                        continue;
                    }
                    combinedPacket.size += packet.size;
                }
                combinedPackets.push(combinedPacket);
            }
        }
        return combinedPackets;
    };
    me.getOptions = function () {
        return me.options;
    };
    me.setOptions = function (options) {
        var reload = false;
        if(options.filterNode !== me.options.filterNode) {
            reload = true;
        }
        me.options = Object.assign({}, me.options, options);
        me.log("monitor options set to: " + JSON.stringify(me.options));
        if(reload) {
            me.reload();
        }
    };
    me.reset = function () {
        me.packets = [];
        me.runIndex = 0;
        me.streamIndex = 0;
        me.statistics = {};
    };
    me.newStream = function () {
        me.streamIndex++;
    };
    me.newRun = function () {
        me.runIndex++;
    }
};
