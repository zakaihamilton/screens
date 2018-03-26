/*
 @author Zakai Hamilton
 @component ServiceNetControl
 */

package.service.netcontrol = function ServiceNetControl(me) {
    me.setup = function (callback, ref) {
        callback();
    };
    me.defaultEffects = {
        autoIncreasePacketDelay:true,
        packetDelay:0,
        packetDelayIncrease:5,
        packetDelayMax:300
    };
    me.effects = Object.assign({}, me.defaultEffects);
    me.newStream = function() {
        if(me.effects.autoIncreasePacketDelay) {
            var packetDelay = parseInt(me.effects.packetDelay);
            if(!packetDelay || packetDelay < 0) {
                packetDelay = 0;
            }
            me.effects.packetDelay = packetDelay + me.effects.packetDelayIncrease;
            if(me.effects.packetDelay > me.effects.packetDelayMax) {
                me.effects.packetDelay = 0;
                me.log("newRun");
                me.core.service.sendAll("newRun");
            }
            me.applyEffects(() => {
                
            }, me.effects);
        }
    };
    me.reset = function(callback) {
        me.effects = Object.assign({}, me.defaultEffects);
        me.applyEffects(callback, me.effects);
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
        me.log("using device: "+ device + " to set effects: " + JSON.stringify(effects));
        var cmd = require('node-cmd');
        me.flow(callback, (flow) => {
            flow.check(cmd, "cannot retrieve command lib");
            flow.async(cmd.get, "pwd", flow.callback);
            flow.wait((err, data, stderr) => {
                flow.error(err, "failed to list current directory");
                flow.check(!stderr, "failed with stderr: " + stderr);
                me.log("list current directory: " + data);
                flow.async(cmd.get, "sudo tc qdisc del root dev " + device, flow.callback);
                flow.wait((err, data, stderr) => {
                    if(err) {
                        me.log(err.message);
                    }
                    me.log("reset device output: " + data);
                    if(effects.packetLoss || effects.packetDelay) {
                        me.log("setting packet loss to: " + effects.packetLoss);
                        me.log("setting packet delay to: " + effects.packetDelay);
                        if(effects.packetDelay) {
                            flow.async(cmd.get, "sudo tc qdisc add dev " + device + " root netem delay " + effects.packetDelay + "ms", flow.callback);
                        }
                        if(effects.packetLoss) {
                            flow.async(cmd.get, "sudo tc qdisc add dev " + device + " root netem loss " + effects.packetLoss + "%", flow.callback);
                        }
                        flow.wait((err, data, stderr) => {
                            flow.error(err, "failed to set command:" + device);
                            flow.check(!stderr, "failed with stderr: " + stderr);
                            me.log("set command output: " + data);
                        }, () => {
                            me.log("completed sending: " + JSON.stringify(effects) + " after sending: " + flow.waitCount + " commands");
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
