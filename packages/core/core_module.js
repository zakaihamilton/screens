/*
 @author Zakai Hamilton
 @component CoreModule
 */

package.core.module = new function() {
    package.core.event.forward("core.http", "core.module", true);
    this.recieve = function(info) {
        if(package.core.platform == "server") {
            var fs = require("fs");
            if(info.method == "GET") {
                if(info.url.endsWith(".js")) {
                    var task = package.core.job.begin(info.job);
                    fs.readFile(info.url.substring(1), 'utf8', function (err,data) {
                        console.log("serving file: " + info.url);
                        info["content-type"] = "application/javascript";
                        info.body = data;
                        package.core.job.end(task);
                    });
                }
                else if(info.url.endsWith(".html")) {
                    var task = package.core.job.begin(info.job);
                    fs.readFile(info.url.substring(1), 'utf8', function (err,data) {
                        console.log("serving file: " + info.url);
                        info["content-type"] = "text/html";
                        info.body = data;
                        package.core.job.end(task);
                    });
                }
            }
        }
    };
};
