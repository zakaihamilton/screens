/*
 @author Zakai Hamilton
 @component CoreHttp
 */

package.core.http = function CoreHttp(me) {
    var core = me.package.core;
    if (package.platform === "server") {
        me.port = process.env.PORT || 4040;
    } else {
        me.port = 80;
    }
    me.listeners = [];
    me.init = function () {
        if (me.package.platform === "server") {
            me.http = require("http");
            me.server = me.http.createServer(function (request, response) {
                var body = [];
                request.on('error', function (err) {
                    console.error(err);
                }).on('data', function (chunk) {
                    body.push(chunk);
                }).on('end', function () {
                    if(request.url.includes("private")) {
                        response.writeHead(200);
                        response.end("cannot load private files remotely");
                    }
                    else {
                        me.handleRequest(request, response, body);
                    }
                });
            });
            me.server.listen(me.port, function (err) {
                if (err) {
                    return core.console.log("something bad happened", err);
                }
                core.console.log("server is listening on " + core.http.port);
            });
        }
    };
    me.handleRequest = function (request, response, body) {
        if(body) {
            body = Buffer.concat(body).toString();
        }
        var job = core.job.create();
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
            query: core.http.parse_query(query),
            headers: request.headers,
            code: 200,
            "content-type": "application/json",
            body: body,
            job: job,
            response: response,
            custom: false
        };
        core.object.attach(info, me);
        core.property.set(info, "receive");
        core.job.complete(job, function () {
            if(info.custom === false) {
                response.writeHead(info.code, {
                    "Content-Type": info["content-type"],
                });
                response.end(info.body);
            }
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
    me.send = function (info, async = true) {
        if (me.package.platform === "server") {
            var request = {
                url:info.url,
                headers:null,
                method:info.method.toUpperCase()
            };
            var response = {
                writeHead : function() { },
                end : function(body) {
                    if (info.callback) {
                        info.response = body;
                        info.callback(info);
                    }
                }
            };
            core.console.log("sending request:"  + JSON.stringify(request) + " body: " + info.body);
            me.handleRequest(request, response, info.body);
        } else {
            var request = new XMLHttpRequest();
            if (info.mimeType && request.overrideMimeType) {
                request.overrideMimeType(info.mimeType);
            }
            core.console.log("sending request info:" + JSON.stringify(info));
            request.open(info.method, info.url, async);
            if (async) {
                request.onreadystatechange = function (e) {
                    if (request.readyState === 4) {
                        if (request.status === 200 || request.status === 201) {
                            if (info.callback) {
                                info.response = request.responseText;
                                info.callback(info);
                            }
                        } else if (info.hasOwnProperty("failure")) {
                            if (info.callback) {
                                info.status = request.status;
                                info.callback(info);
                            }
                        }
                    }
                };
            }
            request.send(info.body);
            if (!async && request.status === 200) {
                return request.responseText;
            }
        }
    };
};
