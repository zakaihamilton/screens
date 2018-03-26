/*
 @author Zakai Hamilton
 @component ServiceNetMonitor
 @prerequisites npm install https://github.com/mranney/node_pcap.git
 */

package.service.netmonitor = function ServiceNetMonitor(me) {
    me.setup = function (callback, ref) {
        me.device = null;
        me.packets = [];
        me.timer = null;
        me.runIndex = 0;
        me.streamIndex = 0;
        me.options = {enablePush:true};
        me.core.service.config(config => {
            if (config) {
                me.pcap = require('pcap');
                me.tracker = new me.pcap.TCPTracker();
                me.util = require('util');
                var devices = config.device;
                if (devices && !Array.isArray(devices)) {
                    devices = [devices];
                }
                var filter = config.filter;
                if(filter) {
                    filter = filter.replace("@port", me.core.http.port);
                    me.log("using filter: " + filter);
                }
                for (var device of devices) {
                    me.session = null;
                    try {
                        me.session = me.pcap.createSession(device, filter);
                    } catch (e) {

                    }
                    if (me.session) {
                        me.log("connected through device: " + device + " filter: " + filter);
                        me.device = device;
                        break;
                    }
                }
                if (me.session) {
                    me.session.on('packet', function (rawPacket) {
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
                        if(netcontrol) {
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
                    setInterval(() => {
                        if(me.options.enablePush) {
                            var packets = me.packets;
                            me.packets = [];
                            if(packets && packets.length) {
                                me.manager.packet.push(() => {

                                }, packets, ref);
                            }
                        }
                    }, parseInt(config.delay));
                } else {
                    me.log("cannot connect through any of the following devices: " + devices);
                }
                callback();
            }
        }, me.__component);
    };
    me.enablePush = function(callback, flag) {
        me.options.enablePush = flag;
        callback();
    };
    me.isPushEnabled = function(callback) {
        callback(me.options.enablePush);
    };
    me.reset = function(callback) {
        me.packets = [];
        me.runIndex = 0;
        me.streamIndex = 0;
        callback();
    };
    me.newStream = function() {
        me.streamIndex++;
    };
    me.newRun = function() {
        me.runIndex++;
    }
};
