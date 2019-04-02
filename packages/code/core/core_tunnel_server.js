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
        let body = info.body;
        if (!url) {
            return "No url parameter passed in query";
        }
        if (!method) {
            return "No method parameter passed in query";
        }
        let headers = Object.assign({}, info.headers);
        let qs = Object.assign({}, query);
        delete qs.url;
        delete qs.method;
        delete headers.origin;
        delete headers.host;
        delete headers.referer;
        delete headers.cookie;
        delete headers["user-agent"];
        me.log("tunneling request url: " + url + " method: " + method + " headers: " + JSON.stringify(headers) + " query: " + JSON.stringify(qs));
        return new Promise((resolve, reject) => {
            me.request({ url, method, headers, body, qs }, function (err, response, body) {
                if (err) {
                    me.log_error("error for url: " + url + " err: " + err);
                    reject(err);
                    return;
                }
                info.body = body;
                info.code = response.statusCode;
                info["content-type"] = response.caseless.get("Content-Type");
                me.log("tunneling response url: " + url + " code: " + info.code + " body: " + info.body + " content-type: " + info["content-type"]);
                resolve();
            });
        });
    };
    return "server";
};