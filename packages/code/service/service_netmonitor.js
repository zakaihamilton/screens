/*
 @author Zakai Hamilton
 @component ServiceNetMonitor
 @prerequisites npm install https://github.com/mranney/node_pcap.git
 */

package.service.netmonitor = function ServiceNetMonitor(me) {
    me.setup = function (callback, ref) {
        me.core.service.config(config => {
            if(config) {
                me.pcap = require('pcap');
                me.util = require('util');
                var devices = config.device;
                if(devices && !Array.isArray(devices)) {
                    devices = [devices];
                }
                for(var device of devices) {
                    me.pcap_session = null;
                    try {
                        me.pcap_session = me.pcap.createSession(device, config.filter);
                    }
                    catch(e) {
                        
                    }
                    if(me.pcap_session) {
                        me.core.console.log("connected through device: " + device +  " filter: " + config.filter);
                        break;
                    }
                }
                if(me.pcap_session) {
                    me.pcap_session.on('packet', function (raw_packet) {
                        var packet = me.pcap.decode.packet(raw_packet);
                        me.manager.packet.push(() => {

                        }, packet, ref);
                    });
                }
                else {
                    me.core.console.log("cannot connect through any of the following devices: " + devices);
                }
                callback();
            }
        }, me.__component);
    };
};
