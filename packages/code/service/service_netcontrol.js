/*
 @author Zakai Hamilton
 @component ServiceNetControl
 */

package.service.netcontrol = function ServiceNetControl(me) {
    me.setup = function (callback, ref) {
        callback();
    };
    me.affect = function(callback, params) {
        var device = me.service.netmonitor.device;
        if(!device) {
            device = "wlan0";
        }
        if(!params) {
            params = {};
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
                    if(params.packetLoss || params.packetDelay) {
                        console.log("setting packet loss to: " + params.packetLoss);
                        console.log("setting packet delay to: " + params.packetDelay);
                        if(params.packetDelay) {
                            flow.async(cmd.get, "sudo tc qdisc add dev " + device + " root netem delay " + params.packetDelay, flow.callback);
                        }
                        if(params.packetLoss) {
                            flow.async(cmd.get, "sudo tc qdisc add dev " + device + " root netem loss " + params.packetLoss, flow.callback);
                        }
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
