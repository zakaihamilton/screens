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
            monitorFilter: "",
            searchFilter: ""
        };
        me.statistics = {};
        me.pcap = require('pcap2');
        me.util = require('util');
        me.config = await me.core.service.config(me.id);
        if (me.config) {
            me.reload();
            if (me.interval) {
                clearInterval(me.interval);
            }
            me.interval = setInterval(async () => {
                me.log("monitor options: " + JSON.stringify(me.options));
                me.log("monitor statistics: " + JSON.stringify(me.statistics));
                if (!me.options.pushPackets) {
                    return;
                }
                if (!me.core.socket.isConnected) {
                    me.log("Server not connected, packets in queue: " + me.packets.length);
                    return;
                }
                var packets = me.packets;
                if (!packets || !packets.length) {
                    return;
                }
                me.packets = [];
                me.log("there are " + packets.length + " packets in queue");
                if (me.options.combinePackets) {
                    packets = await me.combinePackets(packets);
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
        var devices = config.device;
        if (devices && !Array.isArray(devices)) {
            devices = [devices];
        }
        var filter = config.filter;
        if (me.options.monitorFilter) {
            filter = me.options.monitorFilter;
        }
        if (filter) {
            filter = filter.replace("@port", me.core.http.port);
            me.log("using filter: " + filter);
        }
        for (var device of devices) {
            try {
                if (me.session) {
                    me.session.close();
                }
                me.session = new me.pcap.Session(device, { filter });
            } catch (e) {
                me.log_error("Cannot create pcap session for device: " + device + " filter: " + filter + " err: " + e);
            }
            if (me.session) {
                me.log("connected through device: " + device + " filter: " + filter);
                me.device = device;
                break;
            }
        }
        if (me.session) {
            me.session.on('packet', function (rawPacket) {
                if (!me.statistics.packetCount) {
                    me.statistics.packetCount = 0;
                }
                me.statistics.packetCount++;
                if (!me.options.collectPackets) {
                    return;
                }
                var fullPacket = me.pcap.decode.packet(rawPacket);
                var fullPacketString = JSON.stringify(fullPacket);
                var fullPacket = JSON.parse(fullPacketString);
                var packet_sec = me.core.json.traverse(fullPacket, "pcap_header.tv_sec").value;
                var packet_len = me.core.json.traverse(fullPacket, "pcap_header.len").value;
                var packet_source = me.core.json.traverse(fullPacket, "payload.payload.saddr.addr").value;
                var packet_target = me.core.json.traverse(fullPacket, "payload.payload.daddr.addr").value;
                var packet_data = me.core.json.traverse(fullPacket, "payload.payload.payload.data.data").value;
                var match = null;
                if (packet_data) {
                    var packet_string = String.fromCharCode.apply(null, packet_data);
                    var packet_lines = packet_string.split("\n");
                    if (me.options.searchFilter) {
                        var searchFilter = me.core.string.regex(me.options.searchFilter);
                        for (line of packet_lines) {
                            if (line.search(searchFilter) != -1) {
                                match = line;
                                break;
                            }
                        }
                    }
                }
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
                    effects: effects,
                    match: match,
                    count: 1
                };
                me.packets.push(packet);
            });
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
        for (var sourceKey in sources) {
            var source = sources[sourceKey];
            for (var targetKey in source) {
                var target = source[targetKey];
                var first = true;
                var combinedPacket = {};
                for (var packet of target) {
                    if (first) {
                        combinedPacket = packet;
                        first = false;
                        continue;
                    }
                    combinedPacket.size += packet.size;
                    combinedPacket.count++;
                    if (packet.match) {
                        combinedPacket.match = packet.match;
                    }
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
        if (options.monitorFilter !== me.options.monitorFilter) {
            reload = true;
        }
        me.options = Object.assign({}, me.options, options);
        me.log("monitor options set to: " + JSON.stringify(me.options));
        if (reload) {
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
