/*
 @author Zakai Hamilton
 @component CoreModule
 */

package.require("core.module", "server");

package.core.module = function CoreModule(me) {
    var core = me.core;
    me.init = function () {
        me.core.property.link("core.http.receive", "core.module.receive", true);
    };
    me.path_file_to_component = function (file_path) {
        file_path = file_path.substring(file_path.lastIndexOf("/") + 1);
        if (file_path.indexOf("_") === -1) {
            return "";
        }
        var component_path = file_path.replace(/_/g, ".").replace(".js", "");
        return component_path;
    };
    me.loadTextFile = function (task, filePath, callback) {
        me.lock(task, task => {
            me.core.file.readFile(function (err, data) {
                core.console.log("serving text file: " + filePath);
                if (err) {
                    core.console.log(JSON.stringify(err));
                    callback(null);
                } else {
                    callback(data);
                }
                me.unlock(task);
            }, filePath, 'utf8');
        });
    };
    me.loadBinaryFile = function (task, filePath, callback) {
        me.lock(task, task => {
            me.core.file.readFile(function (err, data) {
                core.console.log("serving binary file: " + filePath);
                if (err) {
                    core.console.log(JSON.stringify(err));
                    callback(JSON.stringify(err));
                } else {
                    callback(data);
                }
                me.unlock(task);
                core.console.log("finished serving binary file: " + filePath);
            }, filePath);
        });
    };
    me.receive = {
        set: function (info) {
            if (me.platform === "server") {
                if (info.method === "GET") {
                    var startupApp = "";
                    if (info.url.startsWith("/") && !info.url.includes(".")) {
                        startupApp = info.url.substring(1);
                        info.url = "/main.html";
                    }
                    var file_path = info.url.substring(1);
                    if (file_path.endsWith(".js")) {
                        var component_path = core.module.path_file_to_component(file_path);
                        var target_platform = null;
                        if (component_path) {
                            core.console.log("component_path: " + component_path);
                            target_platform = me.remote(component_path);
                        }
                        var source_platform = info.query["platform"];
                        core.console.log("source_platform:" + source_platform + " target_platform: " + target_platform);
                        info["content-type"] = "application/javascript";
                        if (target_platform && !target_platform.includes(source_platform)) {
                            core.console.log("serving remote for:" + file_path);
                            file_path = "packages/code/remote.js";
                        }
                        info["content-type"] = "application/javascript";
                        me.loadTextFile(info.task, file_path, function (data) {
                            if (data.includes("__json__")) {
                                me.loadTextFile(info.task, file_path.replace(".js", ".json"), function (jsonData) {
                                    info.vars = {"component": component_path, "platform": target_platform, "json": jsonData};
                                    info.body = data;
                                    core.property.set(info, "parse");
                                });
                            } else {
                                info.vars = {"component": component_path, "platform": target_platform};
                                info.body = data;
                                core.property.set(info, "parse");
                            }
                        });
                    } else if (file_path.endsWith(".css")) {
                        info["content-type"] = "text/css";
                        me.loadTextFile(info.task, file_path, function (data) {
                            info.body = data;
                        });
                    } else if (file_path.endsWith(".html")) {
                        info["content-type"] = "text/html";
                        me.loadTextFile(info.task, file_path, function (data) {
                            var startupArgs = info.query["args"];
                            if (!startupArgs) {
                                startupArgs = "";
                            }
                            if (!startupArgs.startsWith("[")) {
                                startupArgs = "[" + startupArgs;
                            }
                            if (!startupArgs.endsWith("]")) {
                                startupArgs = startupArgs + "]";
                            }
                            data = data.replace("__startup_app__", "'" + startupApp + "'");
                            data = data.replace("__startup_args__", startupArgs);
                            info.body = data;
                        });
                    } else if (file_path.endsWith(".png")) {
                        info["content-type"] = "image/png";
                        me.loadBinaryFile(info.task, file_path, function (data) {
                            info.body = data;
                        });
                    } else if (file_path.endsWith(".svg")) {
                        info["content-type"] = "image/svg+xml";
                        me.loadBinaryFile(info.task, file_path, function (data) {
                            info.body = data;
                        });
                    } else if (file_path.endsWith(".json")) {
                        info["content-type"] = "application/json";
                        me.loadTextFile(info.task, file_path, function (data) {
                            info.body = data;
                        });
                    } else if (file_path.endsWith(".m4a") || file_path.endsWith(".mp4")) {
                        var mimeType = file_path.endsWith(".m4a") ? "audio/mp4" : "video/mp4";
                        info.custom = true;
                        me.core.stream.serve(info.headers, info.response, file_path, mimeType);
                    }
                }
            }
        }
    };
};
