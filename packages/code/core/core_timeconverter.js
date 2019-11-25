/*
 @author Zakai Hamilton
 @component TimeConv
 */

screens.core.timeconverter = function CoreTimeConverter(me, { core, storage }) {
    me.init = function () {
        core.property.link("core.http.receive", "core.timeconverter.receive", true);
        me.http = require("http");
        me.moment = require("moment-timezone");
    };
    me.receive = async function (info) {
        if (me.platform === "server" && info.method === "GET" && info.url.startsWith("/api/timeconverter")) {
            const { source, target, date, time } = info.query;
            var result = me.moment.tz(date + " " + time, source).tz(target).format("YY-MM-DD HH:mm");
            info["content-type"] = "text/plain";
            info.body = result;
        }
    };
    return "server";
};
