/*
 @author Zakai Hamilton
 @component ServiceNetControl
 */

screens.service.netcontrol = function ServiceNetControl(me) {
    me.setup = function (ref) {

    };
    me.defaultEffects = {
        packetDelay: 0,
        toggleInterval: 0,
        useEffects: true
    };
    me.effects = Object.assign({}, me.defaultEffects);
    me.init = function () {
        me.cmd = require('node-cmd');
    };
    me.newStream = function () {

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
                    me.log(cmd + " returned error: " + err);
                    reject(err);
                }
                else {
                    me.log(cmd + " returned data: " + data);
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
        me.log("using device: " + device + " to set effects: " + JSON.stringify(effects));
        var currentDir = await me.run("pwd");
        try {
            var data = await me.run("sudo tc qdisc del root dev " + device);
        }
        catch (err) {
            var data = JSON.stringify(err);
        }
        me.log("reset device output: " + data);
        var interval = parseInt(effects.toggleInterval);
        if(interval) {
            if(me.toggleInterval) {
                clearTimeout(me.toggleInterval);
                me.toggleInterval = null;
            }
            me.toggleInterval = setTimeout(() => {
                effects.useEffects = !effects.useEffects;
                me.applyEffects(me.effects);
            }, interval * 1000);
        }
        else {
            if(me.toggleInterval) {
                clearTimeout(me.toggleInterval);
                me.toggleInterval = null;
            }
            effects.useEffects = true;
        }
        me.log("toggle interval: " + interval + " effects are: " + (effects.useEffects ? "on" : "off"));
        me.effects = effects;
        if (me.core.socket.isConnected) {
            await me.manager.packet.updateEffects(effects);
        }
        if(!effects.useEffects) {
            return;
        }
        if (effects.packetLoss || effects.packetDelay || effects.bandwidthRate) {
            if (effects.packetDelay && effects.packetDelay !== "0") {
                me.log("setting packet delay to: " + effects.packetDelay);
                await me.run("sudo tc qdisc add dev " + device + " root netem delay " + effects.packetDelay + "ms");
            }
            if (effects.packetLoss && effects.packetLoss !== "0") {
                me.log("setting packet loss to: " + effects.packetLoss);
                await me.run("sudo tc qdisc add dev " + device + " root netem loss " + effects.packetLoss + "%");
            }
            if (effects.bandwidthRate && effects.bandwidthBurst && effects.bandwidthLatency) {
                me.log("setting bandwidth rate to: " + effects.bandwidthRate +
                    " burst: " + effects.bandwidthBurst +
                    " latency: " + effects.bandwidthLatency);
                await me.run("sudo tc qdisc add dev " + device +
                    " root tbf rate " + effects.bandwidthRate + "kbit" +
                    " burst " + effects.bandwidthBurst + "kbit" +
                    " latency " + effects.bandwidthLatency + "ms");
            }
        }
    };
};
