/*
    @author Zakai Hamilton
    @component CoreHttp
*/

package.core.http = new function CoreHttp() {
    var core = package.core;
    this.port = 8080;
    this.listeners = [];
    this.init = function() {
        if(core.platform === "server") {
            this.http = require("http");
            this.server = this.http.createServer(function(request, response) {
                var body = [];
                  request.on('error', function(err) {
                    console.error(err);
                  }).on('data', function(chunk) {
                    body.push(chunk);
                  }).on('end', function() {
                    body = Buffer.concat(body).toString();
                    var job = core.job.open();
                    var url = request.url;
                    var query = "";
                    var query_offset = url.lastIndexOf("?");
                    if(query_offset != -1) {
                        url = request.url.substring(0, query_offset);
                        query = request.url.substring(query_offset+1);
                    }
                    var info = {
                        method:request.method,
                        url:url,
                        query:core.http.parse_query(query),
                        headers:request.headers,
                        code:200,
                        "content-type":"application/json",
                        body:"",
                        job:job
                    };
                    core.console.log("Received request: " + JSON.stringify(info));
                    core.event.send(core.http.id, "recieve", info);
                    core.job.close(job, function() {
                        response.writeHead(info.code, {
                            "Content-Type": info["content-type"],
                          });
                        response.end(info.body);
                    });
                  });
            });
            this.server.listen(this.port, function(err) {
                if (err) {
                  return core.console.log("something bad happened", err)
                }
                core.console.log("server is listening on " + core.http.port);
            });
        }
    };
    this.parse_query = function(query) {
        var array = {};
        if(query != "") {
            var a = (query[0] === '?' ? query.substr(1) : query).split('&');
            for (var i = 0; i < a.length; i++) {
                var b = a[i].split('=');
                array[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
            }
        }
        return array;
    };
    this.send = function(info) {
        if(core.platform === "client") {
            var request = new XMLHttpRequest();
            request.open(info.method, info.url, false);
            request.send(null);
            if(request.status == 200) {
                return request.responseText;
            }
        }
    };
    this.send_async = function(info) {
        if(core.platform !== "server") {
            var request = new XMLHttpRequest();
            request.open(info.method, info.url, true);
            request.onreadystatechange = function(e) {
                if (request.readyState == 4) {
                    if(request.status == 200 || request.status == 201) {
                        var response = JSON.parse(request.responseText);
                        info.success(response);
                    }
                    else if(info.hasOwnProperty("failure")) {
                        info.failure(request.status);
                    }
                }
            };
            request.send(null);
        }
    };
    this.init();
};
