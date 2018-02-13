/*
 @author Zakai Hamilton
 @component ServiceNetControl
 */

package.service.netcontrol = function ServiceNetControl(me) {
    me.setup = function (callback, ref) {
        callback();
    };
    me.setPacketLoss = function(callback, packetLoss) {
        console.log("setPacketLoss: " + packetLoss);
        me.packetLoss = packetLoss;
        me.affect(callback);
    };
    me.setPacketDelay = function(callback, packetDelay) {
        console.log("setPacketDelay: " + packetDelay);
        me.packetDelay = packetDelay;
        me.affect(callback);
    };
    me.affect = function(callback) {
        var device = me.service.netmonitor.device;
        if(!device) {
            device = "wlan0";
        }
        console.log("using device: "+ device);
        var cmd = require('node-cmd');
        me.flow(callback, (flow) => {
            flow.check(cmd, "cannot retrieve command lib");
            flow.async(cmd.get, "pwd", flow.callback);
            flow.wait((err, data, stderr) => {
                flow.error(err, "failed to list current directory");
                flow.check(!stderr, "failed with stderr: " + stderr);
                console.log("list current directory: " + data);
                flow.async(cmd.get, "sudo tc qdisc del root dev " + device, flow.callback);
                flow.wait((err, data, stderr) => {
                    if(err) {
                        console.log(err.message);
                    }
                    console.log("reset device output: " + data);
                    if(me.packetLoss || me.packetDelay) {
                        console.log("setting packet loss to: " + me.packetLoss);
                        console.log("setting packet delay to: " + me.packetDelay);
                        flow.async(cmd.get, "sudo tc qdisc add dev " + device + " root netem delay " + me.packetDelay, flow.callback);
                        flow.async(cmd.get, "sudo tc qdisc add dev " + device + " root netem loss " + me.packetLoss, flow.callback);
                        flow.wait((err, data, stderr) => {
                            flow.error(err, "failed to set command:" + device);
                            flow.check(!stderr, "failed with stderr: " + stderr);
                            console.log("set command output: " + data);
                        }, () => {
                            flow.end();
                        });
                    }
                    else {
                        flow.end();
                    }
                });
            });
        });
    };
};
