/*
 @author Zakai Hamilton
 @component ManagerDownload
 */

package.require("manager.download", "server");

package.manager.download = function ManagerDownload(me) {
    me.init = function () {
        me.queue = [];
        me.downloadLimit = 5;
    };
    me.private = {
        findItem : function(from, to) {
            return me.queue.find(function(element) {
                return element.from === from && element.to === to;
            });
        },
        update : function() {
            var downloadCount = 0;
            for(var itemIndex = me.queue.length - 1; itemIndex >= 0; itemIndex--) {
                var item = me.queue[itemIndex];
                if(item.isDownloading) {
                    continue;
                }
                if(downloadCount >= me.downloadLimit) {
                    break;
                }
                me.private.download(item);
                downloadCount++;
            }
        },
        download : function(item) {
            if(item.isDownloading) {
                return;
            }
            me.package.core.file.isFile(function(isFile) {
                if(isFile) {
                    var index = me.queue.indexOf(item);
                    me.queue.splice(index, 1);
                    me.private.notify(item, null);
                }
                else {
                    item.isDownloading = true;
                    me.package.storage.remote.downloadFile(function(err) {
                        var index = me.queue.indexOf(item);
                        if(index !== -1) {
                            me.queue.splice(index, 1);
                        }
                        me.private.notify(item, err);
                        me.private.update();
                    }, item.from, item.to);
                }
            }, item.to);
        },
        notify : function(item, err) {
            var callback = item.callbacks.pop();
            while(callback) {
                callback(err);
                callback = item.callbacks.pop();
            }
        }
    };
    me.push = function(callback, from, to) {
        var item = me.private.findItem(from, to);
        if(item) {
            var index = me.queue.indexOf(item);
            me.queue.splice(index, 1);
            item.callbacks.push(callback);
            me.queue.push(item);
        }
        else {
            me.package.core.file.isFile(function(isFile) {
                if(isFile) {
                    callback(null);
                }
                else {
                    item = {from:from, to:to, isDownloading:false, callbacks:[callback]};
                    me.queue.push(item);
                    me.private.update();
                }
            }, to);
        }
    };
    me.exists = function(callback, from, to) {
        var item = me.private.findItem(from, to);
        callback(item ? true : false);
    };
    me.remove = function(callback, from, to) {
        var item = me.private.findItem(from, to);
        if(item) {
            var index = me.queue.indexOf(item);
            me.queue.splice(index, 1);
        }
        callback();
    };
    me.isDownloading = function(callback, from, to) {
        var item = me.private.findItem(from, to);
        var isDownloading = false;
        if(item) {
            isDownloading = item.isDownloading;
        }
        callback(isDownloading);
    };
};