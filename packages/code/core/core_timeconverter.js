/*
 @author Zakai Hamilton
 @component TimeConv
 */

screens.core.interface = function CoreTimeConverter(me, { core, storage }) {
    me.init = function () {
        core.property.link("core.http.receive", "core.interface.receive", true);
        me.http = require("http");
        me.moment = require("moment-timezone");
        core.mutex.enable(me.id, true);
    };
    me.fetch = function (path) {
        var body = "";
        return new Promise((resolve, reject) => {
            me.http.get(path, res => {
                res.on("data", function (chunk) {
                    body += chunk;
                });
                res.on("close", function () {
                    resolve(body);
                });
                res.on("error", function (e) {
                    reject(e);
                });
            });
        });
    };
    me.receive = async function (info) {
        var unlock = await core.mutex.lock(me.id);
        unlock();
        if (me.platform === "server" && info.method === "GET" && info.url.startsWith("/api/timeconverter")) {
            const { source, target, date, time } = info.query;
            var result = me.moment.tz(date + " " + time, source).tz(target).format("YY-MM-DD HH:mm");
            info["content-type"] = "text/plain";
            info.body = result;
        }
    };
    return "server";
};