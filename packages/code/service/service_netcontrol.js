/*
 @author Zakai Hamilton
 @component ServiceNetControl
 */

package.service.netcontrol = function ServiceNetControl(me) {
    me.setup = function (callback, ref) {
        callback();
    };
    me.affect = function(callback, info) {
        var device = me.service.netmonitor.device;
        if(!device) {
            device = "wlan0";
        }
        if(!info) {
            info = {};
        }
        me.core.console.log("using device: "+ device);
        var cmd = require('node-cmd');
        me.flow(callback, (flow) => {
            flow.check(cmd, "cannot retrieve command lib");
            flow.async(cmd.get, "pwd", flow.callback);
            flow.wait((err, data, stderr) => {
                flow.error(err, "failed to list current directory");
                flow.check(!stderr, "failed with stderr: " + stderr);
                me.core.console.log("list current directory: " + data);
                flow.async(cmd.get, "sudo tc qdisc del root dev " + device, flow.callback);
                flow.wait((err, data, stderr) => {
                    if(err) {
                        me.core.console.log(err.message);
                    }
                    me.core.console.log("reset device output: " + data);
                    if(info.packetLoss || info.packetDelay) {
                        me.core.console.log("setting packet loss to: " + info.packetLoss);
                        me.core.console.log("setting packet delay to: " + info.packetDelay);
                        if(info.packetDelay) {
                            flow.async(cmd.get, "sudo tc qdisc add dev " + device + " root netem delay " + info.packetDelay, flow.callback);
                        }
                        if(info.packetLoss) {
                            flow.async(cmd.get, "sudo tc qdisc add dev " + device + " root netem loss " + info.packetLoss, flow.callback);
                        }
                        flow.wait((err, data, stderr) => {
                            flow.error(err, "failed to set command:" + device);
                            flow.check(!stderr, "failed with stderr: " + stderr);
                            me.core.console.log("set command output: " + data);
                        }, () => {
                            me.core.console.log("completed sending: " + JSON.stringify(info) + " after sending: " + flow.waitCount + " commands");
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
