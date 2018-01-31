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
                me.pcap_session = me.pcap.createSession(config.device, config.filter);
                me.pcap_session.on('packet', function (raw_packet) {
                    var packet = me.pcap.decode.packet(raw_packet);
                    me.manager.packet.push(() => {

                    }, packet, ref);
                });
                callback();
            }
        }, me.__component);
    };
};
