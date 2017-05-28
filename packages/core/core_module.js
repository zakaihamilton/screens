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
    this.params_to_args = function(params) {
        var args = [];
        var args_map = JSON.parse(decodeURIComponent(params));
        var args_count = Object.keys(args_map).length;
        for(var args_index = 0; args_index < args_count; args_index++) {
            args.push(args_map[args_index.toString()]);
        }
        console.log("len:" + args_count + " " + JSON.stringify(args_map) + "=" + JSON.stringify(args));
        return args;
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
                    var args = core.module.params_to_args(params);
                    var component = method.substring(0, method.lastIndexOf("."));
                    var result = package[method].apply(package[component], args);
                    info.body = result;
                }
                else if(info.url.endsWith(".js")) {
                    var task = core.job.begin(info.job);
                    var component_path = core.module.path_file_to_component(file_path);
                    var remote = component_path && package[component_path].remote == true;
                    info["content-type"] = "application/javascript";
                    if(remote === undefined || remote == false) {
                        console.log("component_path: " + component_path);
                        fs.readFile(file_path, 'utf8', function (err,data) {
                            console.log("serving file: " + info.url);
                            info.body = data;
                            core.job.end(task);
                        });
                    }
                    else {
                        fs.readFile("packages/core/remote.js", 'utf8', function (err,data) {
                            console.log("serving remote file as: " + info.url);
                            info.body = data.split("@component").join(component_path);
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
