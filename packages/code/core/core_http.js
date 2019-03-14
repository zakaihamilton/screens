/*
 @author Zakai Hamilton
 @component CoreHttp
 */

screens.core.http = function CoreHttp(me, packages) {
    const { core, db } = packages;
    if (screens.platform === "server") {
        me.port = process.env.PORT || 4040;
    } else if (screens.platform === "service") {
        me.port = 4050;
    } else {
        me.port = 80;
    }
    if (me.port === 4040) {
        me.localhost = true;
    }
    me.listeners = [];
    me.forwardUrl = null;
    me.init = async function () {
        if (me.platform === "server" || me.platform === "service") {
            me.http = require("http");
            me.https = require("https");
            me.fs = require("fs");
            if (me.platform === "server" && me.port !== 4040) {
                try {
                    let server = await me.createServer(true);
                    me.log("secure server is listening");
                    me.io = require("socket.io")(server);
                }
                catch (err) {
                    me.log_error("cannot create secure server, error: " + err);
                }
            }
            me.log("creating normal server");
            let server = await me.createServer(false);
            if (!me.io) {
                me.io = require("socket.io")(server);
            }
            me.log("normal server is listening");
            process.on("SIGINT", () => {
                console.info("SIGINT signal received.");
                server.close(async function (err) {
                    if (err) {
                        console.error(err);
                        process.exit(1);
                    }
                    for (var name of screens.components) {
                        try {
                            var component = me.browse(name);
                            if ("shutdown" in component) {
                                component.shutdown();
                            }
                        }
                        catch (err) {
                            console.error("Failed to shutdown component: " + name + " err: " + err);
                        }
                    }
                    console.log("Components shutdown");
                    process.exit(0);
                });
            });
        }
    };
    me.createServer = async function (secure) {
        var server = null;
        var port = me.port;
        var requestHandler = function (request, response) {
            if (!secure && me.forwardUrl) {
                me.log("forwardUrl: " + me.forwardUrl + " headers: " + JSON.stringify(request.headers) + " url: " + request.url);
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
                        var https = require("https");
                        server = https.createServer(options, requestHandler);
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
    me.clientIp = function (request) {
        var ip = null;
        if (request) {
            ip = core.json.value(request, {
                "headers.x-forwarded-for": value => value ? value.split(",").pop() : null,
                "connection.remoteAddress": null,
                "connection.socket.remoteAddress": null,
                "socket.remoteAddress": null
            });
        }
        return ip;
    };
    me.handleRequest = async function (request, response, body, secure) {
        if (body) {
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
            clientIp: me.clientIp(request),
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
    me.send = async function (info) {
        core.property.object.create(me, info);
        if (!info.headers) {
            info.headers = {};
        }
        await core.property.set(info, "headers", null);
        var headers = Object.assign({}, info.headers);
        if (me.platform === "service") {
            return await core.message.send_server(me.id + ".send", info);
        } else if (me.platform === "server") {
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
                info.responseHeaders["Access-Control-Allow-Origin"] = "*";
                info.responseHeaders["Access-Control-Allow-Headers"] = "Origin, X-Requested-With, Content-Type, Accept";
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
};
