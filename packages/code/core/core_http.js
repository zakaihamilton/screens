/*
 @author Zakai Hamilton
 @component CoreHttp
 */

screens.core.http = function CoreHttp(me) {
    if (screens.platform === "server") {
        me.port = process.env.PORT || 4040;
    } else if (screens.platform === "service") {
        me.port = 4050;
    } else {
        me.port = 80;
    }
    me.listeners = [];
    me.forwardUrl = null;
    me.init = function (task) {
        if (me.platform === "server" || me.platform === "service") {
            me.http = require("http");
            me.https = require("https");
            me.fs = require("fs");
            if (me.platform === "server") {
                me.lock(task, (task) => {
                    me.createServer((server, port, err) => {
                        if (err) {
                            me.log("cannot create secure server, error: " + err);
                            me.unlock(task);
                            return;
                        }
                        me.log("secure server is listening on " + port);
                        me.unlock(task);
                    }, true);
                });
            }
            me.lock(task, (task) => {
                me.createServer((server, port, err) => {
                    if (err) {
                        me.log("cannot create normal server, error: " + err);
                        me.unlock(task);
                        return;
                    }
                    me.log("normal server is listening on " + port);
                    me.unlock(task);
                }, false);
            });
        }
    };
    me.createServer = function (callback, secure) {
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
            request.on('error', function (err) {
                console.error("found http error: " + err);
            }).on('data', function (chunk) {
                body.push(chunk);
            }).on('end', function () {
                if (request.url.includes("private")) {
                    response.writeHead(200);
                    response.end("cannot load private files remotely");
                } else {
                    me.handleRequest(request, response, body);
                }
            });
        };
        if (secure) {
            me.core.private.keys((keys) => {
                if (keys && keys.key && keys.cert && keys.ca) {
                    try {
                        var options = {
                            ca: me.fs.readFileSync(keys.ca),
                            key: me.fs.readFileSync(keys.key),
                            cert: me.fs.readFileSync(keys.cert)
                        };
                        var https = require("https");
                        server = https.createServer(options, requestHandler);
                        port = 443;
                        server.on('error', function (e) {
                            callback(server, port, e);
                        });
                        server.listen(port, function (err) {
                            me.forwardUrl = keys.redirect;
                            callback(server, port, err);
                        });
                    } catch (e) {
                        me.log("Cannot create secure server, error: " + e.message);
                        callback(server, port, e);
                    }
                }
            }, "https");
        } else {
            me.log("using http");
            server = me.http.createServer(requestHandler);
            me.io = require("socket.io")(server);
            server.listen(port, function (err) {
                callback(server, port, err);
            });
        }
    };
    me.clientIp = function (request) {
        var ip = null;
        if (request) {
            ip = me.core.json.value(request, {
                "headers.x-forwarded-for": value => value.split(',').pop(),
                "connection.remoteAddress": null,
                "connection.socket.remoteAddress": null,
                "socket.remoteAddress": null
            });
        }
        return ip;
    };
    me.handleRequest = function (request, response, body, secure) {
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
            query: me.core.http.parse_query(query),
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
        me.core.object(me, info);
        //me.log("url: " + info.url + " query: " + JSON.stringify(info.query) + " headers: " + JSON.stringify(info.headers));
        me.forEach(null, ["check", "receive", "compress", "end"], (task, message) => {
            info.task = task;
            me.core.property.set(info, message);
            if(info.stop) {
                return true;
            }
        }, () => {
            response.writeHead(403);
            response.end();
        });
    };
    me.parse_query = function (query) {
        var array = {};
        if (query !== "") {
            var a = (query[0] === '?' ? query.substr(1) : query).split('&');
            for (var i = 0; i < a.length; i++) {
                var b = a[i].split('=');
                array[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
            }
        }
        return array;
    };
    me.headers = function (info) {

    };
    me.send = function (callback, info, async = true) {
        me.core.object(me, info);
        if (!info.headers) {
            info.headers = {}
        }
        me.core.property.set(info, "headers", headers);
        var headers = Object.assign({}, info.headers);
        if (me.platform === "service") {
            me.core.message.send_server(me.id + ".send", callback, info, async);
        } else if (me.platform === "server") {
            var request = {
                url: info.url,
                headers: headers,
                method: info.method.toUpperCase()
            };
            var response = {
                writeHead: function () { },
                end: function (body) {
                    if (callback) {
                        info.response = body;
                        callback(info);
                    }
                }
            };
            me.log("sending request:" + JSON.stringify(request) + " body: " + info.body + " headers: " + JSON.stringify(info.headers));
            me.handleRequest(request, response, info.body);
        } else {
            var request = new XMLHttpRequest();
            if (info.mimeType && request.overrideMimeType) {
                request.overrideMimeType(info.mimeType);
            }
            me.log("sending request info:" + JSON.stringify(info));
            request.open(info.method, info.url, async);
            if (async) {
                request.onreadystatechange = function (e) {
                    if (request.readyState === 4) {
                        if (request.status === 200 || request.status === 201) {
                            if (callback) {
                                info.response = request.responseText;
                                callback(info);
                            }
                        } else if (info.hasOwnProperty("failure")) {
                            if (callback) {
                                info.status = request.status;
                                callback(info);
                            }
                        }
                    }
                };
            }
            if (headers) {
                for (var key in headers) {
                    request.setRequestHeader(key, headers[key]);
                }
            }
            request.send(info.body);
            if (!async && request.status === 200) {
                return request.responseText;
            }
        }
    };
    me.compress = {
        set: function (info) {

        }
    };
    me.check = {
        set: function (info) {

        }
    };
    me.parse = {
        set: function (info) {

        }
    };
    me.receive = {
        set: function (info) {

        }
    };
    me.end = {
        set: function (info) {
            if (info.custom === false) {
                info.responseHeaders["Content-Type"] = info["content-type"];
                info.response.writeHead(info.code, info.responseHeaders);
                info.response.end(info.body);
            }
        }
    };
};
