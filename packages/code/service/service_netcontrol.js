/*
 @author Zakai Hamilton
 @component ServiceNetControl
 */

package.service.netcontrol = function ServiceNetControl(me) {
    me.setup = function (callback, ref) {
        callback();
    };
    me.setPacketLoss = function(callback, packetLoss) {
        me.packetLoss = packetLoss;
        me.affect(callback);
    };
    me.affect = function(callback) {
        var device = me.service.netmonitor.device;
        if(!device) {
            device = "wlan0";
        }
        var cmd = require('node-cmd');
        me.flow(callback, (flow) => {
            flow.async(cmd.get, "sudo tc qdisc del root dev " + device);
            flow.wait(() => {
                if(me.packetLoss) {
                    flow.async(cmd.get, "sudo tc qdisc add dev " + device + " root netem loss " + me.packetLoss);
                    flow.wait(() => {
                        flow.end();
                    });
                }
                else {
                    flow.end();
                }
            });
        });
    };
};
