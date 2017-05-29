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
                file_path = info.url.substring(1);
                if(info.url.startsWith("/method")) {
                    var find = "/method/";
                    var method = info.url.substring(info.url.indexOf(find)+find.length, info.url.indexOf("("));
                    var params = info.url.substring(info.url.indexOf("(")+1, info.url.lastIndexOf(")"));
                    var args = core.type.unwrap_args(params);
                    var info={method:method,params:args};
                    var result = core.message.receive(info);
                    console.log("type: " + typeof result + " result:" + result);
                    info.body = core.type.wrap(result);
                }
                else if(info.url.endsWith(".js")) {
                    var task = core.job.begin(info.job);
                    var component_path = core.module.path_file_to_component(file_path);
                    var platform = null;
                    if(component_path) {
                        platform = package[component_path].platform;
                    }
                    info["content-type"] = "application/javascript";
                    if(platform) {
                        fs.readFile("packages/remote.js", 'utf8', function (err,data) {
                            console.log("serving remote file as: " + info.url);
                            data = data.split("@component").join(component_path);
                            data = data.split("@platform").join(platform);
                            info.body = data;
                            core.job.end(task);
                        });
                    }
                    else {
                        console.log("component_path: " + component_path);
                        fs.readFile(file_path, 'utf8', function (err,data) {
                            console.log("serving file: " + info.url + " err: " + err);
                            info.body = data;
                            core.job.end(task);
                        });
                    }
                }
                else if(info.url.endsWith(".html")) {
                    var task = core.job.begin(info.job);
                    fs.readFile(file_path, 'utf8', function (err,data) {
                        console.log("serving file: " + info.url);
                        info["content-type"] = "text/html";
                        info.body = data;
                        core.job.end(task);
                    });
                }
            }
        }
    };
};
