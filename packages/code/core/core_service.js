/*
 @author Zakai Hamilton
 @component CoreService
 */

screens.core.service = function CoreService(me, { core }) {
    me.init = async function () {
        if (me.platform === "service") {
            me.log("arguments: " + JSON.stringify(process.argv));
            if (process.argv.length < 4) {
                me.log("params: http://ip:port service_name");
                process.exit(-1);
            }
            me.serviceNames = process.argv.splice(3);
            for (let serviceName of me.serviceNames) {
                me.log("loading service: " + serviceName + "...");
                await me.include("service." + serviceName);
                me.log("setup service: " + serviceName + "...");
                await core.message.send("service." + serviceName + ".setup");
                me.log("setup service: " + serviceName + " complete");
            }
        }
    };
    me.config = async function (name) {
        return await core.util.config("settings." + name);
    };
    me.sendAll = async function (method, ...params) {
        var responses = [];
        if (me.platform === "service") {
            for (var serviceName of me.serviceNames) {
                const fullMethod = "service." + serviceName + "." + method;
                responses.push(await core.message.send(fullMethod, ...params));
            }
            return responses;
        }
        else {
            return core.socket.sendAll("service", method, ...params);
        }
    };
};
