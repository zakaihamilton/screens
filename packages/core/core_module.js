/*
 @author Zakai Hamilton
 @component CoreModule
 */

package.core.module = function CoreModule(me) {
    var core = me.core;
    me.init = function() {
        core.property.link("core.http.receive", "core.module.receive", true);
    };
    me.path_file_to_component = function (file_path) {
        file_path = file_path.substring(file_path.lastIndexOf("/") + 1);
        if (file_path.indexOf("_") === -1) {
            return "";
        }
        var component_path = file_path.replace(/_/g, ".").replace(".js", "");
        return component_path;
    };
    me.loadTextFile = function (job, filePath, callback) {
        if (!me.fs) {
            me.fs = require("fs");
        }
        var task = core.job.begin(job);
        me.fs.readFile(filePath, 'utf8', function (err, data) {
            core.console.log("serving text file: " + filePath);
            if (err) {
                core.console.log(JSON.stringify(err));
                callback(null);
            } else {
                callback(data);
            }
            core.job.end(task);
        });
    };
    me.loadBinaryFile = function (job, filePath, callback) {
        if (!me.fs) {
            me.fs = require("fs");
        }
        var task = core.job.begin(job);
        me.fs.readFile(filePath, function (err, data) {
            core.console.log("serving binary file: " + filePath);
            if (err) {
                core.console.log(JSON.stringify(err));
                callback(JSON.stringify(err));
            } else {
                callback(data);
            }
            core.job.end(task);
            core.console.log("finished serving binary file: " + filePath);
        });
    };
    me.receive = {
        set: function (info) {
            if (me.platform === "server") {
                var fs = require("fs");
                if (info.method === "GET") {
                    if (info.url === "/") {
                        info.url = "/main.html";
                    }
                    var file_path = info.url.substring(1);
                    if (file_path.endsWith(".js")) {
                        var component_path = core.module.path_file_to_component(file_path);
                        var target_platform = null;
                        if (component_path) {
                            console.log("component_path: " + component_path);
                            try {
                                var requirement_platform = me[component_path].require(component_path);
                                if (requirement_platform) {
                                    target_platform = requirement_platform;
                                }
                            } catch (err) {
                                console.log("error: " + err);
                                info.body = null;
                                return;
                            }
                        }
                        var source_platform = info.query["platform"];
                        console.log("source_platform:" + source_platform + " target_platform: " + target_platform);
                        info["content-type"] = "application/javascript";
                        if (target_platform && source_platform !== target_platform) {
                            console.log("serving remote for:" + file_path);
                            file_path = "packages/remote.js";
                        }
                        info["content-type"] = "application/javascript";
                        me.loadTextFile(info.job, file_path.replace(".js", ".json"), function (jsonData) {
                            me.loadTextFile(info.job, file_path, function (data) {
                                info.vars = {"component": component_path, "platform": target_platform, "json": jsonData};
                                info.body = data;
                                core.property.set(info, "parse");
                            });
                        });
                    } else if (file_path.endsWith(".css")) {
                        info["content-type"] = "text/css";
                        me.loadTextFile(info.job, file_path, function (data) {
                            info.body = data;
                        });
                    } else if (file_path.endsWith(".html")) {
                        info["content-type"] = "text/html";
                        me.loadTextFile(info.job, file_path, function (data) {
                            info.body = data;
                        });
                    } else if (file_path.endsWith(".png")) {
                        info["content-type"] = "image/png";
                        me.loadBinaryFile(info.job, file_path, function (data) {
                            info.body = data;
                        });
                    } else if (file_path.endsWith(".json")) {
                        info["content-type"] = "application/json";
                        me.loadTextFile(info.job, file_path, function (data) {
                            info.body = data;
                        });
                    }
                }
            }
        }
    };
};
