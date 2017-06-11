/*
 @author Zakai Hamilton
 @component CoreModule
 */

package.core.module = function CoreModule(me) {
    var core = me.core;
    core.event.forward("core.http", "core.module", true);
    me.path_file_to_component = function(file_path) {
        file_path = file_path.substring(file_path.lastIndexOf("/")+1);
        if(file_path.indexOf("_") === -1) {
            return "";
        }
        var component_path = file_path.replace(/_/g, ".").replace(".js", "");
        return component_path;
    };
    me.receive = function(info) {
        if(me.platform === "server") {
            var fs = require("fs");
            if(info.method === "GET") {
                var file_path = info.url.substring(1);
                if(file_path.endsWith(".js")) {
                    var task = core.job.begin(info.job);
                    var component_path = core.module.path_file_to_component(file_path);
                    var target_platform = null;
                    if(component_path) {
                        console.log("component_path: " + component_path);
                        var requirements = package[component_path].require;
                        if(requirements) {
                            target_platform = requirements.platform;
                        }
                    }
                    var source_platform = info.query["platform"];
                    info["content-type"] = "application/javascript";
                    if(target_platform && source_platform !== target_platform) {
                        console.log("source: " + source_platform + " target: " + target_platform);
                        fs.readFile("packages/remote.js", 'utf8', function (err,data) {
                            core.console.log("serving remote file as: " + info.url);
                            info.vars = {"component":component_path,"platform":target_platform};
                            info.body = data;
                            core.event.send(core.module.id, "parse", info);
                            core.job.end(task);
                        });
                    }
                    else {
                        core.console.log("component_path: " + component_path);
                        fs.readFile(file_path, 'utf8', function (err,data) {
                            core.console.log("serving file: " + info.url + " err: " + err);
                            if(err) {
                                info.body = JSON.stringify(err);
                            }
                            else {
                                info.body = data;
                            }
                            core.event.send(core.module.id, "parse", info);
                            core.job.end(task);
                        });
                    }
                }
                else if(file_path.endsWith(".css")) {
                    var task = core.job.begin(info.job);
                    fs.readFile(file_path, 'utf8', function (err,data) {
                        core.console.log("serving file: " + info.url);
                        info["content-type"] = "text/css";
                        if(err) {
                            info.body = JSON.stringify(err);
                        }
                        else {
                            info.body = data;
                        }
                        core.job.end(task);
                    });
                }
                else if(file_path.endsWith(".html")) {
                    var task = core.job.begin(info.job);
                    fs.readFile(file_path, 'utf8', function (err,data) {
                        core.console.log("serving file: " + info.url);
                        info["content-type"] = "text/html";
                        if(err) {
                            info.body = JSON.stringify(err);
                        }
                        else {
                            info.body = data;
                        }
                        core.job.end(task);
                    });
                }
            }
        }
    };
};
