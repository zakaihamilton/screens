/*
 @author Zakai Hamilton
 @component ServiceNetMonitor
 @prerequisites npm install https://github.com/mranney/node_pcap.git
 */

package.service.netmonitor = function ServiceNetMonitor(me) {
    me.setup = function (ref) {
        me.pcap = require('pcap');
        me.util = require('util');
        me.pcap_session = me.pcap.createSession("en0", "port 80");
        me.pcap_session.on('packet', function (raw_packet) {
            var packet = me.pcap.decode.packet(raw_packet);
            console.log("packet: " + me.util.inspect(packet, false, null) + " raw_packet: " + raw_packet);
            console.dir(packet);
        });
    };
};
