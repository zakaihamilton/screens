/*
 @author Zakai Hamilton
 @component CoreModule
 */

package.require("core.module", "server");

package.core.module = function CoreModule(me) {
    var core = me.core;
    me.init = function () {
        me.core.property.link("core.http.receive", "core.module.receive", true);
        me.autoprefixer = require('autoprefixer');
        me.postcss = require('postcss');
    };
    me.path_file_to_component = function (filePath) {
        filePath = filePath.substring(filePath.lastIndexOf("/") + 1);
        if (filePath.indexOf("_") === -1) {
            return "";
        }
        var component_path = filePath.replace(/_/g, ".").replace(".js", "");
        return component_path;
    };
    me.loadTextFile = function (task, filePath, callback) {
        me.lock(task, task => {
            me.core.file.readFile(function (err, data) {
                core.console.log("serving text file: " + filePath);
                if (err) {
                    core.console.log(JSON.stringify(err));
                    callback(null, task);
                } else {
                    callback(data, task);
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
                    callback(JSON.stringify(err), task);
                } else {
                    callback(data, task);
                }
                me.unlock(task);
            }, filePath);
        });
    };
    me.handleCode = function (callback, info, filePath, params) {
        me.lock(info.task, (task) => {
            if(filePath.startsWith("/")) {
                filePath = filePath.substring(1);
            }
            var component_path = core.module.path_file_to_component(filePath);
            var target_platform = null;
            if (component_path) {
                core.console.log("component_path: " + component_path);
                target_platform = me.remote(component_path);
            }
            var source_platform = info.query["platform"];
            core.console.log("source_platform:" + source_platform + " target_platform: " + target_platform);
            info["content-type"] = "application/javascript";
            if (target_platform && !target_platform.includes(source_platform) && !target_platform.includes("/")) {
                core.console.log("serving remote for:" + filePath);
                filePath = "packages/code/remote.js";
            }
            info["content-type"] = "application/javascript";
            me.loadTextFile(task, filePath, function (data, task) {
                if (data && data.includes("__json__")) {
                    me.loadTextFile(info.task, filePath.replace(".js", ".json"), function (jsonData) {
                        info.vars = {"component": component_path, "platform": target_platform, "json": jsonData};
                        info.body += data;
                        core.property.set(info, "parse");
                    });
                } else {
                    info.vars = {"component": component_path, "platform": target_platform};
                    info.body += data;
                    core.property.set(info, "parse");
                }
            });
            me.unlock(task, callback);
        });
    };
    me.handleFile = function (info, filePath, params) {
        if (filePath.endsWith(".js")) {
            var files = filePath.split(",");
            info.body = "";
            me.lock(info.task, (task) => {
                var file = files[0];
                var folder = me.core.path.folder(file);
                var name = me.core.path.name(file);
                if(name.includes("*")) {
                    me.lock(task, (task) => {
                        me.core.file.readDir((err, items) => {
                            files = items.map((filePath) => {
                                return folder + "/" + filePath;
                            });
                            files = files.filter((filePath) => {
                                return filePath.endsWith(".js");
                            });
                            files.unshift(file);
                            me.unlock(task);
                        }, folder);
                    });
                }
                else if(files.length > 1) {
                    files = files.slice(1).map((filePath) => {
                        return folder + "/" + filePath;
                    });
                    files.unshift(file);
                }
                me.unlock(task, () => {
                    me.flow(null, (flow) => {
                        files.map((filePath) => {
                            flow.async(me.handleCode, flow.callback, info, filePath, params);
                        });
                        flow.wait(null, () => {
                            flow.end();
                        }, 1);
                    });
                });
            });
        } else if (filePath.endsWith(".css")) {
            info["content-type"] = "text/css";
            me.loadTextFile(info.task, filePath, function (data, task) {
                me.lock(task, task => {
                    me.postcss([me.autoprefixer]).process(data).then(function (result) {
                        result.warnings().forEach(function (warn) {
                            me.core.console.warn(warn.toString());
                        });
                        info.body = result.css;
                        me.unlock(task);
                    });
                });
            });
        } else if (filePath.endsWith(".html")) {
            info["content-type"] = "text/html";
            me.loadTextFile(info.task, filePath, function (data) {
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
                data = data.replace("__startup_app__", "'" + params.startupApp + "'");
                data = data.replace("__startup_args__", startupArgs);
                info.body = data;
            });
        } else if (filePath.endsWith(".png")) {
            info["content-type"] = "image/png";
            me.loadBinaryFile(info.task, filePath, function (data) {
                info.body = data;
            });
        } else if (filePath.endsWith(".svg")) {
            info["content-type"] = "image/svg+xml";
            me.loadBinaryFile(info.task, filePath, function (data) {
                info.body = data;
            });
        } else if (filePath.endsWith(".json")) {
            info["content-type"] = "application/json";
            me.loadTextFile(info.task, filePath, function (data) {
                info.body = data;
            });
        } else if (filePath.endsWith(".m4a")) {
            var mimeType = "audio/mp4";
            info.custom = true;
            me.core.stream.serve(info.headers, info.response, filePath, mimeType);
        } else if (filePath.endsWith(".mp4")) {
            var mimeType = "video/mp4";
            info.custom = true;
            me.core.stream.serve(info.headers, info.response, filePath, mimeType);
        } else if (filePath.endsWith(".mp3")) {
            var mimeType = "audio/mpeg";
            info.custom = true;
            me.core.stream.serve(info.headers, info.response, filePath, mimeType);
        }
    };
    me.receive = {
        set: function (info) {
            if (me.platform === "server") {
                if (info.method === "GET") {
                    var params = {};
                    if (info.url.startsWith("/") && !info.url.includes(".")) {
                        params.startupApp = info.url.substring(1);
                        info.url = "/main.html";
                    }
                    var filePath = info.url.substring(1);
                    me.handleFile(info, filePath, params);
                }
            }
        }
    };
};
