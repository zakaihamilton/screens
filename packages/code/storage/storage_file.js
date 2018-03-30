/*
 @author Zakai Hamilton
 @component StorageFile
 */

screens.storage.file = function StorageFile(me) {
    me.init = function () {
        me.dropbox = require("dropbox");
        me.fs = require("fs");
        me.https = require('https');
    };
    me.getService = function (callback) {
        if (me.service) {
            callback(me.service);
            return;
        }
        me.core.private.keys((keys) => {
            me.service = new me.dropbox({ accessToken: keys['access-token'] });
            callback(me.service);
        }, "dropbox");
    };
    me.fixPath = function (path) {
        if (path === "/") {
            return "";
        }
        return path;
    };
    me.getChildren = function (callback, path, recursive) {
        me.log("requesting items for path: " + path + " recursive: " + recursive);
        var entries = [];
        me.getService((service) => {
            me.lock(task => {
                me.iterate(task, service, entries, path, null, recursive);
                me.unlock(task, () => {
                    if (callback) {
                        me.log("returning " + entries.length + " items for path: " + path + " recursive: " + recursive);
                        callback(entries);
                    }
                });
            });
        });
    };
    me.iterate = function (task, service, entries, path, cursor, recursive) {
        me.lock(task, task => {
            var method = cursor ? "filesListFolderContinue" : "filesListFolder";
            path = me.fixPath(path);
            service[method]({ path: path })
                .then(function (response) {
                    entries.push(...response.entries);
                    if (response.has_more) {
                        me.iterate(task, service, entries, path, response.cursor, recursive);
                    } else if (recursive) {
                        for (let item of response.entries) {
                            if (item[".tag"] !== "folder") {
                                continue;
                            }
                            item.entries = [];
                            me.iterate(task, service, item.entries, item.path_lower, null, recursive);
                        }
                    }
                    me.unlock(task);
                })
                .catch(function (error) {
                    if (error) {
                        me.error("error saving data for type: " + type + " id: " + id + " err:" + error);
                    }
                    me.unlock(task);
                });
        });
    };
    me.createFolder = function (callback, path) {
        me.getService((service) => {
            path = me.fixPath(path);
            var folderRef = service.filesCreateFolder({ path: path, autorename: false });
            callback(folderRef);
        });
    };
    me.downloadData = function (callback, path) {
        me.getService((service) => {
            path = me.fixPath(path);
            try {
                service.filesDownload({ path: path }).then(function (response) {
                    callback(response, null);
                })
                    .catch(function (error) {
                        callback(null, error);
                    });
            } catch (err) {
                callback(null, err.message);
            }
        });
    };
    me.uploadData = function (callback, path, data) {
        me.getService((service) => {
            path = me.fixPath(path);
            service.filesUpload({ path: path, contents: data }).then(function (response) {
                callback(response, null);
            })
                .catch(function (error) {
                    callback(null, error);
                });
        });
    };
    me.metadata = function (callback, path) {
        me.getService((service) => {
            path = me.fixPath(path);
            service.filesGetMetadata({ path: path }).then(function (response) {
                callback(response);
            })
                .catch(function (error) {
                    callback(error);
                });
        });
    };
    me.downloadFile = function (callback, from, to) {
        me.getService((service) => {
            var path = me.fixPath(from);
            service.filesGetTemporaryLink({ path: path }).then(result => {
                const req = me.https.get(result.link, res => {
                    res.pipe(me.fs.createWriteStream(to));
                });
                req.on('close', function () {
                    callback(null);
                });
                req.on('error', function (e) {
                    callback(e.message);
                });
            }).catch(function (e) {
                callback(e.message);
            });
        });
    };
    me.uploadFile = function (callback, from, to) {
        me.fs.readFile(from, "binary", function (err, data) {
            if (err) {
                callback(err);
            } else {
                me.uploadData(function (err) {
                    callback(err);
                }, to, data);
            }
        });
    };
    return "server";
};
