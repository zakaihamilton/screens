/*
 @author Zakai Hamilton
 @component ServiceNetMonitor
 @prerequisites npm install https://github.com/mranney/node_pcap.git
 */

package.service.netmonitor = function ServiceNetMonitor(me) {
    me.setup = function (callback, ref) {
        me.device = null;
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
                    me.core.console.log("using filter: " + filter);
                }
                for (var device of devices) {
                    me.session = null;
                    try {
                        me.session = me.pcap.createSession(device, filter);
                    } catch (e) {

                    }
                    if (me.session) {
                        me.core.console.log("connected through device: " + device + " filter: " + filter);
                        me.device = device;
                        break;
                    }
                }
                if (me.session) {
                    me.session.on('packet', function (raw_packet) {
                        var packet = me.pcap.decode.packet(raw_packet);
                        if (filter && filter.includes("tcp")) {
                            me.tracker.track_packet(packet);
                        }
                        packet = JSON.parse(JSON.stringify(packet));
                        var node = me.core.json.traverse(packet, "payload.payload.payload.data");
                        if (node.item) {
                            delete node.parent["data"];
                        }
                        me.manager.packet.push(() => {

                        }, packet, ref);
                    });
                    if (filter && filter.includes("tcp")) {
                        me.tracker.on('start', function (session) {
                            me.core.console.log("Start of TCP session between " + session.src_name + " and " + session.dst_name);
                        });
                        me.tracker.on('end', function (session) {
                            me.core.console.log("End of TCP session between " + session.src_name + " and " + session.dst_name);
                        });
                    }
                } else {
                    me.core.console.log("cannot connect through any of the following devices: " + devices);
                }
                callback();
            }
        }, me.__component);
    };
};
