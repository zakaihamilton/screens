/*
 @author Zakai Hamilton
 @component CoreModule
 */

screens.core.module = function CoreModule(me) {
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
                me.log("serving text file: " + filePath);
                if (err) {
                    me.log(JSON.stringify(err));
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
                me.log("serving binary file: " + filePath);
                if (err) {
                    me.log(JSON.stringify(err));
                    callback(JSON.stringify(err), task);
                } else {
                    callback(data, task);
                }
                me.unlock(task);
            }, filePath);
        });
    };
    me.handleStylesheet = function(callback, info, filePath, params) {
        info["content-type"] = "text/css";
        me.loadTextFile(info.task, filePath, function (data, task) {
            me.lock(task, task => {
                me.postcss([me.autoprefixer]).process(data).then(function (result) {
                    result.warnings().forEach(function (warn) {
                        me.warn(warn.toString());
                    });
                    info.body += result.css;
                    me.unlock(task, callback);
                });
            });
        });
    };
    me.handleCode = function (callback, info, filePath, params) {
        me.lock(info.task, (task) => {
            if(filePath.startsWith("/")) {
                filePath = filePath.substring(1);
            }
            var component_path = me.core.module.path_file_to_component(filePath);
            var target_platform = null;
            if (component_path) {
                me.log("component_path: " + component_path);
                try {
                    target_platform = screens(component_path).require;
                }
                catch(err) {

                }
            }
            var source_platform = info.query["platform"];
            me.log("source_platform:" + source_platform + " target_platform: " + target_platform);
            info["content-type"] = "application/javascript";
            if (target_platform && target_platform !== source_platform) {
                me.log("serving remote for:" + filePath);
                filePath = "packages/code/remote.js";
            }
            info["content-type"] = "application/javascript";
            me.loadTextFile(task, filePath, function (data, task) {
                if (data && data.includes("__json__")) {
                    me.loadTextFile(info.task, filePath.replace(".js", ".json"), function (jsonData) {
                        info.vars = {"component": component_path, "platform": target_platform, "json": jsonData};
                        info.body += data;
                        me.core.property.set(info, "parse");
                    });
                } else {
                    info.vars = {"component": component_path, "platform": target_platform};
                    info.body += data;
                    me.core.property.set(info, "parse");
                }
            });
            me.unlock(task, callback);
        });
    };
    me.handleMultiFiles = function(info, filePath, params) {
            var files = filePath.split(",");
            info.body = "";
            me.lock(info.task, (task) => {
                var file = files[0];
                var folder = me.core.path.folderPath(file);
                var name = me.core.path.fileName(file);
                if(name.includes("*")) {
                    me.lock(task, (task) => {
                        me.core.file.readDir((err, items) => {
                            files = items.map((filePath) => {
                                return folder + "/" + filePath;
                            });
                            files = files.filter((filePath) => {
                                return filePath.endsWith(params.extension);
                            });
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
                            flow.async(params.method, flow.callback, info, filePath, params);
                        });
                        flow.wait(null, () => {
                            flow.end();
                        }, 1);
                    });
                });
            });        
    };
    me.handleFile = function (info, filePath, params) {
        if (filePath.endsWith(".js")) {
            params = Object.assign({}, params);
            params.method = me.handleCode;
            params.extension = ".js";
            me.handleMultiFiles(info, filePath, params);
        } else if (filePath.endsWith(".css")) {
            params = Object.assign({}, params);
            params.method = me.handleStylesheet;
            params.extension = ".css";
            me.handleMultiFiles(info, filePath, params);
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
                startupArgs = startupArgs.replace(/[/"]/g, "'");
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
        } else if (filePath.endsWith(".txt")) {
            info["content-type"] = "text/plain";
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
    return "server";
};
