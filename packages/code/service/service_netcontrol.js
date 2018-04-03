/*
 @author Zakai Hamilton
 @component ServiceNetControl
 */

screens.service.netcontrol = function ServiceNetControl(me) {
    me.setup = function (ref) {

    };
    me.defaultEffects = {
        autoIncreasePacketDelay: true,
        packetDelay: 0,
        packetDelayIncrease: 5,
        packetDelayMax: 300
    };
    me.effects = Object.assign({}, me.defaultEffects);
    me.newStream = function () {
        if (me.effects.autoIncreasePacketDelay) {
            var packetDelay = parseInt(me.effects.packetDelay);
            if (!packetDelay || packetDelay < 0) {
                packetDelay = 0;
            }
            me.effects.packetDelay = packetDelay + me.effects.packetDelayIncrease;
            if (me.effects.packetDelay > me.effects.packetDelayMax) {
                me.effects.packetDelay = 0;
                me.log("newRun");
                me.core.service.sendAll("newRun");
            }
            me.applyEffects(() => {

            }, me.effects);
        }
    };
    me.reset = async function () {
        me.effects = Object.assign({}, me.defaultEffects);
        await me.applyEffects(me.effects);
    };
    me.retrieveEffects = function () {
        return me.effects;
    };
    me.run = async function (cmd) {
        me.log("running: " + cmd);
        return new Promise((resolve, reject) => {
            me.cmd.get(cmd, (err, data, stderr) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    };
    me.applyEffects = async function (effects) {
        var device = me.service.netmonitor.device;
        if (!device) {
            device = "wlan0";
        }
        if (!effects) {
            effects = {};
        }
        me.effects = effects;
        me.log("using device: " + device + " to set effects: " + JSON.stringify(effects));
        var cmd = require('node-cmd');
        var currentDir = await me.run("pwd");
        var data = await me.run("sudo tc qdisc del root dev " + device);
        me.log("reset device output: " + data);
        if (effects.packetLoss || effects.packetDelay) {
            me.log("setting packet loss to: " + effects.packetLoss);
            me.log("setting packet delay to: " + effects.packetDelay);
            if (effects.packetDelay) {
                await me.run("sudo tc qdisc add dev " + device + " root netem delay " + effects.packetDelay + "ms");
            }
            if (effects.packetLoss) {
                await me.run("sudo tc qdisc add dev " + device + " root netem loss " + effects.packetLoss + "%");
            }
        }
    };
};
