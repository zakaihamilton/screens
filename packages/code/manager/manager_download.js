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
        download : async function(item) {
            if(item.isDownloading) {
                return;
            }
            me.log("checking if file exists, path: " + item.to);
            var isFile = await me.core.file.isFile(item.to);
            if(isFile) {
                var index = me.queue.indexOf(item);
                me.queue.splice(index, 1);
                me.log("found file: " + item.to);
                me.private.notify(item, null, item.to);
            }
            else {
                item.isDownloading = true;
                me.log("downloading: " + item.from + " to: " + item.to);
                await me.storage.file.downloadFile(item.from, item.to);
                me.log("downloaded: " + item.from + " to: " + item.to + " err: " + err);
                var index = me.queue.indexOf(item);
                if(index !== -1) {
                    me.queue.splice(index, 1);
                }
                if(item.convert) {
                    var path = me.core.path.replaceExtension(item.to, item.convert);
                    me.log("converting file from: " + item.to + " to: " + path);
                    await me.media.ffmpeg.convert(item.to, item.convert, path);
                    me.private.notify(item, err, path);
                    me.private.update();
                }
                else {
                    me.private.notify(item, err, item.to);
                    me.private.update();
                }
            }
        },
        notify : function(item, err, target) {
            var promise = item.promises.pop();
            while(promise) {
                if(err) {
                    promise.reject(err);
                }
                else {
                    promise.resolve(target);
                }
                promise = item.promises.pop();
            }
        }
    };
    me.push = async function(from, to, convert) {
        var item = me.private.findItem(from, to);
        if(item) {
            return new Promise((resolve, reject) => {
                var index = me.queue.indexOf(item);
                me.queue.splice(index, 1);
                item.promises.push(resolve);
                me.queue.push(item);
            });
        }
        else {
            var path = to;
            if(convert) {
                path = me.core.path.replaceExtension(to, convert);
            }
            var isFile = await me.core.file.isFile(path);
            if(isFile) {
                return path;
            }
            else {
                return new Promise((resolve, reject) => {
                    me.log("pushing to download queue: " + from + " to: " + to);
                    item = {from:from, to:to, isDownloading:false, promises:[{resolve,reject}], convert:convert};
                    me.queue.push(item);
                    me.private.update();
                });
            }
        }
    };
    me.exists = function(from, to) {
        var item = me.private.findItem(from, to);
        return (item ? true : false);
    };
    me.removeall = function() {
        me.queue = [];
    };
    me.remove = function(from, to) {
        var item = me.private.findItem(from, to);
        if(item) {
            var index = me.queue.indexOf(item);
            me.queue.splice(index, 1);
        }
    };
    me.items = function() {
        var items = [];
        for(var item of me.queue) {
            items.push({from:item.from,to:item.to,isDownloading:item.isDownloading,convert:item.convert});
        }
        return items;
    };
    me.isDownloading = async function(from, to) {
        var item = me.private.findItem(from, to);
        var isDownloading = false;
        if(item) {
            isDownloading = item.isDownloading;
        }
        return isDownloading;
    };
    return "server";
};