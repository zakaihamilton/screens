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
    me.readFile = function (path, options) {
        return new Promise((resolve, reject) => {
            me.log("reading file: " + path + " options: " + JSON.stringify(options));
            try {
                me.fs.readFile(path, options, function (err, data) {
                    if (err) {
                        me.error(err);
                        reject(err);
                    }
                    else {
                        me.log("success in reading file: " + path + " length: " + (data ? data.length : 0));
                        resolve(data);
                    }
                });
            }
            catch (err) {
                me.error(err);
                reject(err);
            }
        });
    };
    me.makeDir = function (path) {
        return new Promise((resolve, reject) => {
            me.fs.mkdir(path, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    };
    me.makeDirEx = async function (path) {
        var tokens = path.split("/");
        var mkdirPath = "";
        var error = null;
        for (var token of tokens) {
            if (mkdirPath) {
                mkdirPath += "/" + token;
            }
            else {
                mkdirPath = token;
            }
            await me.makeDir(mkdirPath);
        }
    };
    me.readDir = function (path) {
        return new Promise((resolve, reject) => {
            me.fs.readdir(path, function (err, items) {
                me.log("path:" + path + " items:" + JSON.stringify(items));
                if (err) {
                    reject(err);
                }
                else {
                    resolve(items);
                }
            });
        });
    };
    me.delete = function (path) {
        return new Promise((resolve, reject) => {
            me.fs.stat(path, function (err, stats) {
                if (err) {
                    reject(err);
                    return;
                }
                if (stats && stats.isDirectory()) {
                    me.fs.rmdir(path, function (err) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    });
                } else {
                    me.fs.unlink(path, function (err) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    });
                }
            });
        });
    };
    me.isFile = function (path) {
        return new Promise((resolve, reject) => {
            me.fs.stat(path, function (err, stats) {
                if (err) {
                    reject(err);
                }
                else {
                    var isFile = stats ? stats.isFile() : false;
                    resolve(isFile);
                }
            });
        });
    };
    me.isDirectory = function (path) {
        return new Promise((resolve, reject) => {
            me.fs.stat(path, function (err, stats) {
                if (err) {
                    reject(err);
                }
                else {
                    var isDirectory = stats ? stats.isDirectory() : false;
                    resolve(isDirectory);
                }
            });
        });
    };
    me.size = function (path) {
        return new Promise((resolve, reject) => {
            me.fs.stat(path, function (err, stats) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(stats.size);
                }
            });
        });
    };
    me.exists = function (path) {
        return me.fs.existsSync(path);
    };
    me.download = async function (source, target) {
        var folder = me.core.path.goto(target, "..");
        me.log("downloading: " + source + " to: " + target);
        await me.makeDirEx(folder);
        var file = me.fs.createWriteStream(target);
        if (!file) {
            throw "Cannot create stream: " + target;
        }
        var protocol = me.http;
        if (source.startsWith("https:")) {
            protocol = me.https;
        }
        return new Promise((resolve, reject) => {
            protocol.get(source, function (response) {
                response.pipe(file);
                file.on('finish', function () {
                    me.log("downloaded: " + source + " to: " + target);
                    file.close(resolve);
                });
            }).on('error', function (err) {
                me.fs.unlink(target);
                reject(err);
            });
        });
    };
    me.open = function (path) {
        var session = me.core.session.open();
        session.path = path;
        return session.handle;
    };
    me.pause = function(handle) {
        var session = me.core.session.get(handle);
        if (session.stream) {
            session.stream.pause();
        }
    };
    me.resume = function(handle) {
        var session = me.core.session.get(handle);
        if (session.stream) {
            session.stream.resume();
        }
    };
    me.read = function (handle, callback, chunkSize) {
        var result = false;
        var session = me.core.session.get(handle);
        if (!session.stream) {
            var params = {};
            if(chunkSize) {
                params.highWaterMark = chunkSize;
            }
            session.stream = me.fs.createReadStream(session.path, params);
            if (session.stream) {
                session.stream.on('data', data => {
                    callback(data);
                });
                session.stream.on('close', () => {
                    callback(null);
                });
                session.close = () => {
                    if (session.stream) {
                        session.stream.destroy();
                        session.stream = null;
                    }
                };
                result = true;
            }
        }
        return result;
    };
    me.write = function (handle, data) {
        var result = false;
        var session = me.core.session.get(handle);
        if (!session.stream) {
            session.stream = me.fs.createWriteStream(session.path);
            session.close = () => {
                if (session.stream) {
                    session.stream.end();
                    session.stream = null;
                }
            };
        }
        if (session.stream) {
            var buffer = Buffer.from(data);
            session.stream.write(buffer);
            result = true;
        }
        return result;
    };
    me.close = function (handle) {
        me.core.session.close(handle);
    };
    return "server";
};
