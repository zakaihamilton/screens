/*
 @author Zakai Hamilton
 @component CoreHttp
 */

package.core.http = function CoreHttp(me) {
    if (package.platform === "server") {
        me.port = process.env.PORT || 4040;
    }
    else if (package.platform === "service") {
        me.port = 4041;
    } else {
        me.port = 80;
    }
    me.listeners = [];
    me.init = function () {
        if (me.platform === "server" || me.platform === "service") {
            me.http = require("http");
            me.server = me.http.createServer(function (request, response) {
                var body = [];
                request.on('error', function (err) {
                    console.error(err);
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
            me.server.listen(me.port, function (err) {
                if (err) {
                    return me.core.console.log("something bad happened", err);
                }
                me.core.console.log("server is listening on " + me.core.http.port);
            });
        }
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
            var ip = request && ((request.headers['x-forwarded-for'] && request.headers['x-forwarded-for'].split(',').pop()) ||
                    (request.connection && request.connection.remoteAddress) ||
                    (request.socket && request.socket.remoteAddress) ||
                    (request.connection && request.connection.socket && request.connection.socket.remoteAddress));
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
                ip: ip
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
                    response.writeHead(info.code, {
                        "Content-Type": info["content-type"],
                    });
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
        if(me.platform === "service") {
            me.core.message.send_server(me.id + ".send", callback, info, async);
        }
        else if (me.platform === "server") {
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
