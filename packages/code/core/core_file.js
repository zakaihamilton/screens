/*
 @author Zakai Hamilton
 @component CoreFile
 */

screens.core.file = function CoreFile(me) {
    me.init = function () {
        me.fs = require("fs");
        me.http = require("http");
        me.https = require("https");
    };
    me.readFile = function (callback, path, options) {
        try {
            me.fs.readFile(path, options, function (err, data) {
                callback(err, data);
            });
        }
        catch(e) {
            callback(e);
        }
    };
    me.makeDir = function (callback, path) {
        me.fs.mkdir(path, function (err) {
            callback(err);
        });
    };
    me.makeDirEx = function(callback, path) {
        var tokens = path.split("/");
        var mkdirPath = "";
        var error = null;
        me.flow(callback, (flow) => {
            tokens.map((token) => {
                if(mkdirPath) {
                    mkdirPath += "/" + token;
                }
                else {
                    mkdirPath = token;
                }
                flow.async(me.makeDir, flow.callback, mkdirPath);
            });
            flow.wait((err) => {
                if(err) {
                    error = err;
                }
            }, () => {
                if(error) {
                    flow.error(error, "failed to create directory " + path);
                }
                flow.end();
            }, 1);
        });
    };
    me.readDir = function (callback, path) {
        me.fs.readdir(path, function (err, items) {
            me.log("path:" + path + " items:" + JSON.stringify(items));
            callback(err, items);
        });
    };
    me.delete = function (callback, path) {
        me.fs.stat(path, function (err, stats) {
            if (err) {
                callback(err);
                return;
            }
            if (stats && stats.isDirectory()) {
                me.fs.rmdir(path, function (err) {
                    callback(err);
                });
            } else {
                me.fs.unlink(path, function (err) {
                    callback(err);
                });
            }
        });
    };
    me.isFile = function (callback, path) {
        me.fs.stat(path, function (err, stats) {
            callback(stats ? stats.isFile() : false);
        });
    };
    me.isDirectory = function (callback, path) {
        me.fs.stat(path, function (err, stats) {
            callback(stats ? stats.isDirectory() : false);
        });
    };
    me.size = function (callback, path) {
        me.fs.stat(path, function (err, stats) {
            callback(err, stats.size);
        });
    };
    me.download = function (callback, source, target) {
        var folder = me.core.path.goto(target, "..");
        me.log("downloading: " + source + " to: " + target);
        me.makeDirEx(() => {
            var file = me.fs.createWriteStream(target);
            if(!file) {
                callback(new Error("Cannot create stream: " + target));
                return;
            }
            var protocol = me.http;
            if(source.startsWith("https:")) {
                protocol = me.https;
            }
            protocol.get(source, function (response) {
                response.pipe(file);
                file.on('finish', function () {
                    me.log("downloaded: " + source + " to: " + target);
                    file.close(callback);
                });
            }).on('error', function (err) {
                me.fs.unlink(target);
                callback(err);
            });
        }, folder);
    };
    return "server";
};
