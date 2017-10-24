/*
 @author Zakai Hamilton
 @component StorageCache
 */

package.require("storage.remote", "server");

package.storage.remote = function StorageRemote(me) {
    me.init = function () {
        me.dropbox = require('dropbox');
        //me.getChildren(me.core.json.log, "", true);
    };
    me.getService = function(callback) {
        if(me.service) {
            callback(me.service);
            return;
        }
        me.core.private.keys((keys) => {
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
            var job = me.core.job.open();
            me.iterate(job, service, entries, path, null, recursive);
            me.core.job.close(job, () => {
                if(callback) {
                    callback(entries);
                }
            });
        });
    };
    me.iterate = function(job, service, entries, path, cursor, recursive) {
        var task = me.core.job.begin(job);
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
            me.core.job.end(task);
          })
          .catch(function(error) {
              me.core.job.end(task);
          });
    };
    me.createFolder = function(callback, path) {
        me.getService((service) => {
            path = me.fixPath(path);
            var folderRef = service.filesCreateFolder({path:path,autorename:false});
            callback(folderRef);
        });
    };
};
