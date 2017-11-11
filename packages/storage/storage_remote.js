/*
 @author Zakai Hamilton
 @component StorageCache
 */

package.require("storage.remote", "server");

package.storage.remote = function StorageRemote(me) {
    me.init = function () {
        me.dropbox = require("dropbox");
        me.fs = require("fs");
    };
    me.getService = function(callback) {
        if(me.service) {
            callback(me.service);
            return;
        }
        me.package.core.private.keys((keys) => {
            me.service = new me.dropbox({ accessToken: keys['access-token'] });
            callback(me.service);
        }, "dropbox");
    };
    me.fixPath = function(path) {
        if(path === "/") {
            return "";
        }
        return path;
    };
    me.getChildren = function(callback, path, recursive) {
        var entries = [];
        me.getService((service) => {
            var job = me.package.core.job.open();
            me.iterate(job, service, entries, path, null, recursive);
            me.package.core.job.close(job, () => {
                if(callback) {
                    callback(entries);
                }
            });
        });
    };
    me.iterate = function(job, service, entries, path, cursor, recursive) {
        var task = me.package.core.job.begin(job);
        var method = cursor ? "filesListFolderContinue" : "filesListFolder";
        path = me.fixPath(path);
        service[method]({path: path})
          .then(function(response) {
            entries.push(...response.entries);
            if(response.has_more) {
                me.iterate(job, service, entries, path, response.cursor, recursive);
            }
            else if(recursive) {
                for(let item of response.entries) {
                    if(item[".tag"] !== "folder") {
                        continue;
                    }
                    item.entries = [];
                    me.iterate(job, service, item.entries, item.path_lower, null, recursive);
                }
            }
            me.package.core.job.end(task);
          })
          .catch(function(error) {
              me.package.core.job.end(task);
          });
    };
    me.createFolder = function(callback, path) {
        me.getService((service) => {
            path = me.fixPath(path);
            var folderRef = service.filesCreateFolder({path:path,autorename:false});
            callback(folderRef);
        });
    };
    me.downloadData = function(callback, path) {
        me.getService((service) => {
            path = me.fixPath(path);
            try {
                service.filesDownload({path:path}).then(function(response) {
                    callback(response, null);
                })
                .catch(function(error) {
                    callback(null, error);
                });
            }
            catch(err) {
                callback(null, err.message);
            }
        });
    };
    me.uploadData = function(callback, path, data) {
        me.getService((service) => {
            path = me.fixPath(path);
            service.filesUpload({path:path,contents:data}).then(function(response) {
                callback(response, null);
            })
            .catch(function(error) {
                callback(null, error);
            });
        });
    };
    me.metadata = function(callback, path) {
        me.getService((service) => {
            path = me.fixPath(path);
            service.filesGetMetadata({path:path}).then(function(response) {
                callback(response);
            })
            .catch(function(error) {
                callback(error);
            });
        });
    };
    me.downloadFile = function(callback, from, to) {
        me.package.core.console.log("Downloading: " + from);
        me.downloadData(function(data, error) {
            if(data && data.fileBinary) {
                me.package.core.console.log("Writing file to: " + to);
                me.fs.writeFile(to, data.fileBinary, "binary", function (err) {
                    callback(err);
                });
            }
            else {
                me.package.core.console.log("Cannot download file: " + from + "because of: " + error);
                callback("Cannot download file: " + from + "because of: " + error);
            }
        }, from);
    };
    me.uploadFile = function(callback, from, to) {
        me.fs.readFile(from, "binary", function (err, data) {
            if(err) {
                callback(err);
            }
            else {
                me.uploadData(function(err) {
                    callback(err);
                }, to, data);
            }
        });
    };
};
