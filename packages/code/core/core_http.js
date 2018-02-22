/*
 @author Zakai Hamilton
 @component CoreHttp
 */

package.core.http = function CoreHttp(me) {
    if (package.platform === "server") {
        me.port = process.env.PORT || 4040;
    } else if (package.platform === "service") {
        me.port = 4050;
    } else {
        me.port = 80;
    }
    me.listeners = [];
    me.init = function (task) {
        if (me.platform === "server" || me.platform === "service") {
            me.lock(task, (task) => {
                me.createServer((server) => {
                    server.listen(me.port, function (err) {
                        if (err) {
                            return me.core.console.log("something bad happened", err);
                        }
                        me.core.console.log("server is listening on " + me.core.http.port);
                        me.unlock(task);
                    });
                }, function (request, response) {
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
                });
            });
        }
    };
    me.createServer = function (callback, requestHandler) {
        var service = null;
        me.https = require("https");
        if (me.platform === "server") {
            var useSecure = true;
            me.core.private.keys((keys) => {
                if(keys && keys.key && keys.cert) {
                    var options = {
                        key: keys.key.join("\n"),
                        cert: keys.cert.join("\n")
                    };
                    me.core.console.log("using https");
                    var https = require("https");
                    try {
                        service = https.createServer(options, requestHandler);
                        callback(service);
                    }
                    catch(e) {
                        me.core.console.error("Cannot create secure server, error: " + e.message);
                        useSecure = false;
                    }
                }
                else {
                    useSecure = false;
                }
                if(!useSecure) {
                    me.core.console.log("using http");
                    var http = require("http");
                    service = http.createServer(requestHandler);
                    callback(service);
                }
            }, "https");
        }
        else {
            me.core.console.log("using http");
            var http = require("http");
            service = http.createServer(requestHandler);
            callback(service);
        }
    };
    me.clientIp = function(request) {
        var ip = null;
        if(request) {
            ip = request.headers['x-forwarded-for'];
            if(ip) {
                ip = request.headers['x-forwarded-for'].split(',').pop();
            }
            if(!ip) {
                if(request.connection) {
                    ip = request.connection.remoteAddress;
                    if(!ip) {
                        if(request.connection.socket) {
                            ip = request.connection.socket.remoteAddress;
                        }
                    }
                }
            }
            if(!ip) {
                if(request.socket) {
                    ip = request.socket.remoteAddress;
                }
            }
        }
        return ip;
    };
    me.handleRequest = function (request, response, body) {
        if (body) {
            body = Buffer.concat(body).toString();
        }
        me.lock(task => {
            var url = request.url;
            var query = "";
            var query_offset = url.lastIndexOf("?");
            if (query_offset !== -1) {
                url = request.url.substring(0, query_offset);
                query = request.url.substring(query_offset + 1);
            }
            var info = {
                method: request.method,
                url: decodeURIComponent(url),
                query: me.core.http.parse_query(query),
                headers: request.headers,
                code: 200,
                "content-type": "application/json",
                body: body,
                task: task,
                response: response,
                custom: false,
                check: true,
                clientIp: me.clientIp(request),
                responseHeaders: {}
            };
            me.core.object.attach(info, me);
            me.core.property.set(info, "check");
            if (!info.check) {
                response.writeHead(403);
                response.end();
            }
            me.core.property.set(info, "receive");
            me.unlock(task, () => {
                if (info.custom === false) {
                    info.responseHeaders["Content-Type"] = info["content-type"];
                    response.writeHead(info.code, info.responseHeaders);
                    response.end(info.body);
                }
            });
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
    me.send = function (callback, info, async = true) {
        var headers = Object.assign({}, info.headers);
        me.core.object.attach(info, me);
        me.core.property.set(info, "headers", headers);
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
            me.core.console.log("sending request:" + JSON.stringify(request) + " body: " + info.body);
            me.handleRequest(request, response, info.body);
        } else {
            var request = new XMLHttpRequest();
            if (info.mimeType && request.overrideMimeType) {
                request.overrideMimeType(info.mimeType);
            }
            me.core.console.log("sending request info:" + JSON.stringify(info));
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
};
