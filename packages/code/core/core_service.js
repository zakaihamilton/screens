/*
 @author Zakai Hamilton
 @component CoreService
 */

screens.core.service = function CoreService(me) {
    me.init = async function () {
        if (me.platform === "service") {
            me.log("arguments: " + JSON.stringify(process.argv));
            if (process.argv.length < 4) {
                me.log("params: http://ip:port service_name");
                process.exit(-1);
            }
            me.serviceNames = process.argv.splice(3);
            for (serviceName of me.serviceNames) {
                me.log("loading service: " + serviceName + "...");
                await me.include("service." + serviceName);
                me.log("setup service: " + serviceName + "...");
                await me.core.message.send("service." + serviceName + ".setup");
                me.log("setup service: " + serviceName + " complete");
            }
        }
    };
    me.config = async function (name) {
        return await me.core.util.config("settings." + name);
    };
    me.sendAll = async function (method, param) {
        var responses = [];
        var args = Array.prototype.slice.call(arguments);
        if (me.platform === "service") {
            for (var serviceName of me.serviceNames) {
                args[0] = "service." + serviceName + "." + method;
                responses.push(await me.core.message.send.apply(null, args));
            }
            return responses;
        }
        else {
            return me.core.socket.sendAll("service", ...args);
        }
    };
};
