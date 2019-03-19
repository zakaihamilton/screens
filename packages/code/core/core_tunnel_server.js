/*
    @author Zakai Hamilton
    @component CoreTask
*/

screens.core.tunnel = function CoreTunnel(me, packages) {
    const { core } = packages;
    me.init = function () {
        core.property.link("core.http.receive", "core.tunnel.receive", true);
        me.request = require("request");
    };
    me.receive = async function (info) {
        if (me.platform !== "server" || !info.url.startsWith("/api/tunnel")) {
            return;
        }
        let query = info.query;
        let url = query.url;
        let method = query.method;
        if (!url) {
            return "No url parameter passed in query";
        }
        if (!method) {
            return "No method parameter passed in query";
        }
        delete query.url;
        delete query.method;
        me.log("tunneling: " + url + " method: " + method + " headers: " + info.headers + " query: " + JSON.stringify(query));
        return new Promise((resolve, reject) => {
            me.request({ url, method, headers: info.headers, body: info.body, qs: query }, function (err, response, body) {
                if (err) {
                    reject(err);
                    return;
                }
                info.body = body;
                info.code = response.statusCode;
                info["content-type"] = response.caseless.get("Content-Type");
                resolve();
            });
        });
    }
    return "server";
};