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
        findItem: function (from, to) {
            return me.queue.find(function (element) {
                return element.from === from && element.to === to;
            });
        },
        update: function () {
            var downloadCount = 0;
            for (var itemIndex = me.queue.length - 1; itemIndex >= 0; itemIndex--) {
                var item = me.queue[itemIndex];
                if (item.isDownloading) {
                    continue;
                }
                if (downloadCount >= me.downloadLimit) {
                    break;
                }
                me.private.download(item);
                downloadCount++;
            }
        },
        download: function (item) {
            if (item.isDownloading) {
                return true;
            }
            me.log("checking if file exists, path: " + item.to);
            var exists = me.core.file.exists(item.to);
            if (exists) {
                var index = me.queue.indexOf(item);
                me.queue.splice(index, 1);
                me.log("found file: " + item.to);
                return item.to;
            }
            else {
                item.isDownloading = true;
                me.log("downloading: " + item.from + " to: " + item.to);
                me.storage.file.downloadFile(item.from, item.to).then(() => {
                    me.log("downloaded: " + item.from + " to: " + item.to);
                    var index = me.queue.indexOf(item);
                    me.queue.splice(index, 1);
                    me.private.update();
                }).catch(err => {
                    me.log("failed to download: " + item.from + " to: " + item.to + " err: " + err);
                    var index = me.queue.indexOf(item);
                    me.queue.splice(index, 1);
                    me.private.update();
                });
            }
        }
    };
    me.get = function (from, to) {
        var item = me.private.findItem(from, to);
        if (!item) {
            var exists = me.core.file.exists(to);
            if (exists) {
                me.log(to + " already downloaded");
                return to;
            }
            else {
                me.log("pushing to download queue: " + from + " to: " + to);
                item = {
                    from: from,
                    to: to
                };
                me.queue.push(item);
                me.private.update();
            }
        }
    };
    me.removeall = function () {
        me.queue = [];
    };
    me.remove = function (from, to) {
        var item = me.private.findItem(from, to);
        if (item) {
            var index = me.queue.indexOf(item);
            me.queue.splice(index, 1);
        }
    };
    me.items = function () {
        var items = [];
        for (var item of me.queue) {
            items.push({
                from: item.from,
                to: item.to,
                isDownloading: item.isDownloading,
                isDownloaded: item.isDownloaded
            });
        }
        return items;
    };
    me.clean = async function(path) {
        var items = null;
        me.log("deleting files in: " + path);
        try {
            items = await me.core.file.readDir(path);
        }
        catch(err) {
            me.log("Cannot read dir, err: " + err.message || err);
        }
        if (items) {
            for (let item of items) {
                try {
                    await me.core.file.delete(path + "/" + item);
                    me.log("deleted file: " + item);
                }
                catch(err) {
                    me.log("cannot delete file: " + item);
                }
            }
        }
        await me.manager.download.removeall();
    }
    return "server";
};