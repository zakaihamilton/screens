/*
 @author Zakai Hamilton
 @component CoreModule
 */

package.core.module = new function() {
    var core = package.core;
    core.event.forward("core.http", "core.module", true);
    this.path_file_to_component = function(file_path) {
        file_path = file_path.substring(file_path.lastIndexOf("/")+1);
        if(file_path.indexOf("_") == -1) {
            return "";
        }
        var component_path = file_path.replace("_", ".").replace(".js", "");
        return component_path;
    };
    this.recieve = function(info) {
        if(core.platform == "server") {
            var fs = require("fs");
            if(info.method == "GET") {
                var file_path = info.url.substring(1);
                if(info.url.startsWith("/method")) {
                    var find = "/method/";
                    var method = info.url.substring(info.url.indexOf(find)+find.length);
                    var args = core.type.unwrap_args(info.query);
                    var message={method:method,params:args};
                    var result = core.message.receive(message);
                    info.body = core.type.wrap(result);
                }
                else if(file_path.endsWith(".js")) {
                    var task = core.job.begin(info.job);
                    var component_path = core.module.path_file_to_component(file_path);
                    var target_platform = null;
                    if(component_path) {
                        target_platform = package[component_path].platform;
                    }
                    var source_platform = info.query["platform"];
                    info["content-type"] = "application/javascript";
                    if(target_platform && source_platform !== target_platform) {
                        console.log("source: " + source_platform + " target: " + target_platform);
                        fs.readFile("packages/remote.js", 'utf8', function (err,data) {
                            core.console.log("serving remote file as: " + info.url);
                            data = data.split("@component").join(component_path);
                            data = data.split("@platform").join(target_platform);
                            info.body = data;
                            core.job.end(task);
                        });
                    }
                    else {
                        core.console.log("component_path: " + component_path);
                        fs.readFile(file_path, 'utf8', function (err,data) {
                            core.console.log("serving file: " + info.url + " err: " + err);
                            info.body = data;
                            core.job.end(task);
                        });
                    }
                }
                else if(file_path.endsWith(".html")) {
                    var task = core.job.begin(info.job);
                    fs.readFile(file_path, 'utf8', function (err,data) {
                        core.console.log("serving file: " + info.url);
                        info["content-type"] = "text/html";
                        info.body = data;
                        core.job.end(task);
                    });
                }
            }
        }
    };
};
