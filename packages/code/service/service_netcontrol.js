/*
 @author Zakai Hamilton
 @component ServiceNetControl
 */

package.service.netcontrol = function ServiceNetControl(me) {
    me.setup = function (callback, ref) {
        callback();
    };
    me.effects = {autoIncreasePacketDelay:true};
    me.signal = function() {
        if(me.effects.autoIncreasePacketDelay) {
            var packetDelay = parseInt(me.effects.packetDelay);
            if(packetDelay < 0) {
                packetDelay = 0;
            }
            me.effects.packetDelay = packetDelay + 5;
            me.applyEffects(() => {
                
            }, me.effects);
        }
    };
    me.reset = function(callback) {
        me.effects = {autoIncreasePacketDelay:true};
        callback();
    };
    me.retrieveEffects = function(callback) {
        callback(me.effects);
    };
    me.applyEffects = function(callback, effects) {
        var device = me.service.netmonitor.device;
        if(!device) {
            device = "wlan0";
        }
        if(!effects) {
            effects = {};
        }
        me.effects = effects;
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
                    if(effects.packetLoss || effects.packetDelay) {
                        me.core.console.log("setting packet loss to: " + effects.packetLoss);
                        me.core.console.log("setting packet delay to: " + effects.packetDelay);
                        if(effects.packetDelay) {
                            flow.async(cmd.get, "sudo tc qdisc add dev " + device + " root netem delay " + effects.packetDelay + "ms", flow.callback);
                        }
                        if(effects.packetLoss) {
                            flow.async(cmd.get, "sudo tc qdisc add dev " + device + " root netem loss " + effects.packetLoss + "%", flow.callback);
                        }
                        flow.wait((err, data, stderr) => {
                            flow.error(err, "failed to set command:" + device);
                            flow.check(!stderr, "failed with stderr: " + stderr);
                            me.core.console.log("set command output: " + data);
                        }, () => {
                            me.core.console.log("completed sending: " + JSON.stringify(effects) + " after sending: " + flow.waitCount + " commands");
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
