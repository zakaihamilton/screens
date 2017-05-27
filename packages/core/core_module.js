/*
 @author Zakai Hamilton
 @component CoreEvent
 */

package.core.module = new function() {
    package.core.event.forward("core.http", "core.module")
    this.recieve = function(info) {
        if(package.core.platform == "server") {
            var fs = require(fs);
            if(info.method == "GET" && info.url.endsWith(".js")) {
                var task = package.core.job.begin(info);
                fs.readFile(info.url, 'utf8', function (err,data) {
                    info["content-type"] = "application/javascript";
                    info.body = data;
                    package.core.job.end(task);
                });
            }
        }
    };
};
