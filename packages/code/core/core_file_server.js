/*
 @author Zakai Hamilton
 @component CoreFile
 */

screens.core.file = function CoreFile(me, { core }) {
    me.init = function () {
        me.fs = require("fs");
        me.http = require("http");
        me.https = require("https");
        core.file.path = core.file.alias.path;
    };
    me.readFile = function (path, options, optional) {
        path = me.path(path);
        return new Promise((resolve, reject) => {
            try {
                me.fs.readFile(path, options, function (err, data) {
                    if (err) {
                        if (optional) {
                            resolve(null);
                        }
                        else {
                            me.log_error(err);
                            reject(err);
                        }
                    }
                    else {
                        resolve(data);
                    }
                });
            }
            catch (err) {
                me.log_error(err);
                reject(err);
            }
        });
    };
    me.writeFile = function (path, data, options, optional) {
        path = me.path(path);
        return new Promise((resolve, reject) => {
            try {
                me.fs.writeFile(path, data, options, function (err) {
                    if (err) {
                        if (optional) {
                            resolve(null);
                        }
                        else {
                            me.log_error(err);
                            reject(err);
                        }
                    }
                    else {
                        resolve(null);
                    }
                });
            }
            catch (err) {
                me.log_error(err);
                reject(err);
            }
        });
    };
    me.rename = function (source, target) {
        source = me.path(source);
        target = me.path(target);
        return new Promise((resolve, reject) => {
            me.fs.rename(source, target, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    };
    me.makeDir = function (path) {
        path = me.path(path);
        return new Promise((resolve, reject) => {
            me.fs.mkdir(path, function (err) {
                if (err) {
                    if (err.code == "EEXIST") {
                        resolve();
                    }
                    else {
                        reject(err);
                    }
                }
                else {
                    resolve();
                }
            });
        });
    };
    me.makeDirEx = async function (path) {
        path = me.path(path);
        var tokens = path.split("/");
        var mkdirPath = "";
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
    me.iterate = async function (path, recursive, callback) {
        var names = await me.readDir(path);
        for (var name of names) {
            if (recursive) {
                var isDirectory = await me.isDirectory(path + "/" + name);
                if (isDirectory) {
                    await me.iterate(path + "/" + name, true, callback);
                    continue;
                }
            }
            if (callback) {
                await callback(path + "/" + name);
            }
        }
    };
    me.readDir = function (path) {
        path = me.path(path);
        return new Promise((resolve, reject) => {
            me.fs.readdir(path, function (err, items) {
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
        path = me.path(path);
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
        path = me.path(path);
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
        path = me.path(path);
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
        path = me.path(path);
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
    me.timestamp = function (path) {
        path = me.path(path);
        return new Promise((resolve, reject) => {
            me.fs.stat(path, function (err, stats) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(stats.mtimeMs);
                }
            });
        });
    };
    me.exists = function (path) {
        path = me.path(path);
        return me.fs.existsSync(path);
    };
    me.download = async function (source, target) {
        target = me.path(target);
        var folder = core.path.goto(target, "..");
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
                file.on("finish", function () {
                    me.log("downloaded: " + source + " to: " + target);
                    file.close(resolve);
                });
            }).on("error", function (err) {
                me.fs.unlink(target);
                reject(err);
            });
        });
    };
    me.open = function (path) {
        var session = core.session.open();
        session.path = path;
        return session.handle;
    };
    me.pause = function (handle) {
        var session = core.session.get(handle);
        if (session.stream) {
            session.stream.pause();
        }
    };
    me.resume = function (handle) {
        var session = core.session.get(handle);
        if (session.stream) {
            session.stream.resume();
        }
    };
    me.read = function (handle, callback, chunkSize) {
        var result = false;
        var session = core.session.get(handle);
        if (!session.stream) {
            var params = {};
            if (chunkSize) {
                params.highWaterMark = chunkSize;
            }
            session.stream = me.fs.createReadStream(session.path, params);
            if (session.stream) {
                session.stream.on("data", data => {
                    callback(data);
                });
                session.stream.on("close", () => {
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
        var session = core.session.get(handle);
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
        core.session.close(handle);
    };
    return "server";
};

screens.core.file.buffer = function CoreFileBuffer(me) {
    me.read = function (path, options) {
        var buffer = undefined;
        path = me.upper.path(path);
        if (me.upper.fs.existsSync(path)) {
            buffer = me.upper.fs.readFileSync(path, options);
        }
        return buffer;
    };
    me.write = function (path, data, options) {
        path = me.upper.path(path);
        me.upper.fs.writeFileSync(path, data, options);
    };
};

screens.core.file.alias = function CoreFileAlias(me) {
    me.aliases = {};
    me.set = function (source, target) {
        if (target) {
            me.aliases[source] = target;
        }
        else {
            delete me.aliases[source];
        }
    };
    me.get = function (source) {
        return me.aliases[source];
    };
    me.path = function (path) {
        if (!path) {
            return null;
        }
        let result = "";
        path.split("/").forEach(token => {
            var target = me.aliases[token];
            if (target) {
                result = target;
                return;
            }
            if (result) {
                result += "/";
            }
            result += token;
        });
        return result;
    };
    return "server";
};
