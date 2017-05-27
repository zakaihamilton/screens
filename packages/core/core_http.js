/*
    @author Zakai Hamilton
    @component CoreHttp
*/

package.core.http = new function CoreHttp() {
    var core = package.core;
    this.port = 8080;
    this.listeners = [];
    if(core.platform === "server") {
        this.http = require("http");
    }
    this.init = function() {
        if(core.platform === "server") {
            this.server = this.http.createServer(function(request, response) {
                console.log("method:" + request.method);
                console.log("url: " + request.url);
                console.log("headers: " + request.headers);
                var body = [];
                  request.on('error', function(err) {
                    console.error(err);
                  }).on('data', function(chunk) {
                    body.push(chunk);
                  }).on('end', function() {
                    body = Buffer.concat(body).toString();
                    var job = core.job.open(info);
                    var info = {
                        method:request.method,
                        url:request.url,
                        headers:request.headers,
                        code:200,
                        "content-type":"application/json",
                        body:"",
                        job:job
                    };
                    core.event.send(this.id, "recieve", info);
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
                  return console.log("something bad happened", err)
                }
                console.log("server is listening on ${port}");
            });
        }
    };
    this.send = function(info) {
        if(core.platform === "client") {
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
};
