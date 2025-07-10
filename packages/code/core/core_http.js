/*
 @author Zakai Hamilton
 @component CoreHttp
 */

screens.core.http = function CoreHttp(me, { core, db }) {
    if (screens.platform === "server") {
        let port = core.args.value("-port");
        if (port) {
            me.port = parseInt(port);
        }
        else {
            me.port = process.env.PORT || 4040;
        }
    } else {
        me.port = 80;
    }
    if (screens.platform === "server") {
        me.localhost = core.args.value("-localhost");
    }
    me.listeners = [];
    me.forwardUrl = null;
    me.init = async function () {
        if (me.platform === "server") {
            me.http = require("http");
            me.https = require("https");
            me.request = require("request");
            me.fs = require("fs");
            if (me.platform === "server" && !me.localhost) {
                try {
                    await me.createServer(true);
                    me.log("secure server is listening");
                }
                catch (err) {
                    me.log_error("cannot create secure server, error: " + err);
                }
            }
            me.log("creating normal server");
            await me.createServer(false).then(server => {
                me.log("normal server is listening");
                process.on("SIGINT", () => {
                    // eslint-disable-next-line no-console
                    console.info("SIGINT signal received.");
                    server.close(async function (err) {
                        if (err) {
                            // eslint-disable-next-line no-console
                            console.error(err);
                            process.exit(1);
                        }
                        await Promise.all(core.broadcast.send("shutdown"));
                        // eslint-disable-next-line no-console
                        console.log("Components shutdown");
                        process.exit(0);
                    });
                });
                setTimeout(() => {
                    core.broadcast.send("httpReady");
                }, 100);
            });
        }
    };
    me.createServer = async function (secure) {
        var server = null;
        var port = me.port;
        var requestHandler = function (request, response) {
            response.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
            response.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
            if (!secure && me.forwardUrl) {
                response.writeHead(301, {
                    Location: me.forwardUrl + request.url
                });
                response.end();
                return;
            }
            var body = [];
            request.on("error", function (err) {
                me.log_error("found http error: " + err);
            }).on("data", function (chunk) {
                body.push(chunk);
            }).on("end", async function () {
                if (request.url.includes("private") && !await db.shared.settings.get("system.private")) {
                    me.log_error("private files not authorized" + request.url);
                    response.writeHead(403);
                    response.end();
                } else {
                    me.handleRequest(request, response, body);
                }
            });
        };
        if (secure) {
            var keys = await core.private.keys("https");
            if (keys && keys.key && keys.cert && keys.ca) {
                let caBuffer = await core.private.file(keys.ca);
                let keyBuffer = await core.private.file(keys.key);
                let certBuffer = await core.private.file(keys.cert);
                return new Promise((resolve, reject) => {
                    try {
                        var options = {
                            ca: caBuffer,
                            key: keyBuffer,
                            cert: certBuffer
                        };
                        server = me.https.createServer(options, requestHandler);
                        port = 443;
                        server.on("error", function (e) {
                            reject(e);
                        });
                        server.listen(port, function () {
                            me.forwardUrl = keys.redirect;
                            resolve(server);
                        });
                        me.log("Secure server working on port: " + port);
                    } catch (e) {
                        me.log("Failed to create secure server, error: " + e.message);
                        reject(e);
                    }
                });
            }
        } else {
            me.log("using http");
            return new Promise((resolve, reject) => {
                server = me.http.createServer(requestHandler);
                server.on("error", function (e) {
                    reject(e);
                });
                server.listen(port, function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(server);
                        me.log("Normal server working on port: " + port);
                    }
                });
            });
        }
    };
    me.handleRequest = async function (request, response, body, secure) {
        if (body && typeof body !== "string") {
            body = Buffer.concat(body).toString();
        }
        var url = request.url;
        var query = "";
        var query_offset = url.lastIndexOf("?");
        if (query_offset !== -1) {
            url = request.url.substring(0, query_offset);
            query = request.url.substring(query_offset + 1);
        }
        var info = {
            secure: secure,
            method: request.method,
            url: decodeURIComponent(url),
            query: core.http.parse_query(query),
            headers: request.headers,
            code: 200,
            "content-type": "application/json",
            body: body,
            response: response,
            custom: false,
            stop: false,
            responseHeaders: {}
        };
        core.property.object.create(me, info);
        me.log("method: " + info.method + " url: " + info.url + " query: " + JSON.stringify(info.query));
        var messages = ["receive", "compress", "end"];
        core.util.performance("http request url: " + info.url, async () => {
            for (var message of messages) {
                if (info.stop) {
                    break;
                }
                try {
                    await core.property.set(info, message);
                }
                catch (err) {
                    info.stop = true;
                    me.log("error in: " + info.url + " message: " + message + " err: " + (err.message || err) + " stack: " + err.stack);
                    response.writeHead(403);
                    response.end();
                }
            }
        });
    };
    me.parse_query = function (query) {
        var array = {};
        if (query !== "") {
            var a = (query[0] === "?" ? query.substr(1) : query).split("&");
            for (var i = 0; i < a.length; i++) {
                var b = a[i].split("=");
                array[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || "");
            }
        }
        return array;
    };
    me.headers = function () {

    };
    me.prepare = async function (info) {
        core.property.object.create(me, info);
        if (!info.headers) {
            info.headers = {};
        }
        await core.property.set(info, "headers", null);
        const headers = Object.assign({}, info.headers);
        return headers;
    };
    me.send = async function (info) {
        const headers = await me.prepare(info);
        if (me.platform === "server") {
            return new Promise((resolve, reject) => {
                var request = {
                    url: info.url,
                    headers: headers,
                    method: info.method.toUpperCase()
                };
                var response = {
                    writeHead: function () { },
                    end: function (body) {
                        if (body) {
                            me.log("returning body of length: " + body.length);
                        }
                        else {
                            me.log("returning no result");
                        }
                        resolve(body);
                    }
                };
                me.log("sending request:" + JSON.stringify(request) + " body: " + info.body + " headers: " + JSON.stringify(info.headers));
                try {
                    me.handleRequest(request, response, info.body);
                }
                catch (err) {
                    reject(err);
                }
            });
        } else {
            if (info.remote) {
                return await core.message.send_server("core.http.send", info);
            }
            var request = new XMLHttpRequest();
            if (info.mimeType && request.overrideMimeType) {
                request.overrideMimeType(info.mimeType);
            }
            me.log("sending request:" + info.url);
            request.open(info.method, info.url, true);
            return new Promise((resolve, reject) => {
                request.onreadystatechange = function () {
                    if (request.readyState === 4) {
                        if (request.status === 200 || request.status === 201) {
                            resolve(request.responseText);
                        }
                        else {
                            reject(request.status);
                        }
                    }
                };
                if (headers) {
                    for (var key in headers) {
                        request.setRequestHeader(key, headers[key]);
                    }
                }
                request.send(info.body);
            });
        }
    };
    me.compress = {
        set: function () {

        }
    };
    me.check = {
        set: function () {

        }
    };
    me.parse = {
        set: function () {

        }
    };
    me.receive = {
        set: function () {

        }
    };
    me.end = {
        set: function (info) {
            if (info.custom === false) {
                info.responseHeaders["Content-Type"] = info["content-type"];
                info.responseHeaders["Access-Control-Allow-Methods"] = "*";
                info.responseHeaders["Access-Control-Allow-Origin"] = "*";
                info.responseHeaders["Access-Control-Allow-Headers"] = "*";
                info.response.writeHead(info.code, info.responseHeaders);
                info.response.end(info.body);
            }
        }
    };
    me.urlEncode = function (obj) {
        var str = [];
        for (var p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        return str.join("&");
    };
    me.get = async function (url) {
        if (me.platform === "server") {
            return new Promise((resolve, reject) => {
                me.log("requesting: " + url);
                me.request.get(url, (error, response, body) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(body);
                    }
                });
            });
        }
        else {
            return core.message.send_server("core.http.get", url);
        }
    };
};
