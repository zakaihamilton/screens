/*
 @author Zakai Hamilton
 @component ManagerDownload
 */

screens.manager.download = function ManagerDownload(me) {
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
            me.log("checking if file exists, path: " + item.to);
            me.core.file.isFile(function(isFile) {
                if(isFile) {
                    var index = me.queue.indexOf(item);
                    me.queue.splice(index, 1);
                    me.log("found file: " + item.to);
                    me.private.notify(item, null, item.to);
                }
                else {
                    item.isDownloading = true;
                    me.log("downloading: " + item.from + " to: " + item.to);
                    me.storage.file.downloadFile(function(err) {
                        me.log("downloaded: " + item.from + " to: " + item.to + " err: " + err);
                        var index = me.queue.indexOf(item);
                        if(index !== -1) {
                            me.queue.splice(index, 1);
                        }
                        if(item.convert) {
                            var path = me.core.path.replaceExtension(item.to, item.convert);
                            me.log("converting file from: " + item.to + " to: " + path);
                            me.media.ffmpeg.convert((err, progress) => {
                                if(!progress) {
                                    me.private.notify(item, err, path);
                                    me.private.update();
                                }
                            }, item.to, item.convert, path);
                        }
                        else {
                            me.private.notify(item, err, item.to);
                            me.private.update();
                        }
                    }, item.from, item.to);
                }
            }, item.to);
        },
        notify : function(item, err, target) {
            var callback = item.callbacks.pop();
            while(callback) {
                callback(err, target);
                callback = item.callbacks.pop();
            }
        }
    };
    me.push = function(callback, from, to, convert) {
        var item = me.private.findItem(from, to);
        if(item) {
            var index = me.queue.indexOf(item);
            me.queue.splice(index, 1);
            item.callbacks.push(callback);
            me.queue.push(item);
        }
        else {
            var path = to;
            if(convert) {
                path = me.core.path.replaceExtension(to, convert);
            }
            me.core.file.isFile(function(isFile) {
                if(isFile) {
                    callback(null, path);
                }
                else {
                    me.log("pushing to download queue: " + from + " to: " + to);
                    item = {from:from, to:to, isDownloading:false, callbacks:[callback], convert:convert};
                    me.queue.push(item);
                    me.private.update();
                }
            }, path);
        }
    };
    me.exists = function(callback, from, to) {
        var item = me.private.findItem(from, to);
        callback(item ? true : false);
    };
    me.removeall = function(callback) {
        me.queue = [];
        callback();
    };
    me.remove = function(callback, from, to) {
        var item = me.private.findItem(from, to);
        if(item) {
            var index = me.queue.indexOf(item);
            me.queue.splice(index, 1);
        }
        callback();
    };
    me.items = function(callback) {
        var items = [];
        for(var item of me.queue) {
            items.push({from:item.from,to:item.to,isDownloading:item.isDownloading,convert:item.convert});
        }
        callback(items);
    };
    me.isDownloading = function(callback, from, to) {
        var item = me.private.findItem(from, to);
        var isDownloading = false;
        if(item) {
            isDownloading = item.isDownloading;
        }
        callback(isDownloading);
    };
    return "server";
};