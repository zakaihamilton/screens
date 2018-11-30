/*
 @author Zakai Hamilton
 @component MediaFile
 */

screens.media.file = function MediaFile(me) {
    me.rootPath = "/Kab/concepts/private";
    me.cachePath = "cache";
    me.init = function () {
        me.metadata = require("music-metadata");
        me.os = require("os");
        me.tempDir = me.os.tmpdir();
        if (me.core.http.port === process.env.PORT) {
            me.core.task.push("media.file.updateListing", 1800000);
            me.updateListing();
        }
    };
    me._listing = {};
    me.info = async function (path) {
        var metadata = null;
        try {
            metadata = await me.metadata.parseFile(path, { duration: true });
        }
        catch (err) {
            metadata = { path: path, error: err };
        }
        return metadata;
    };
    me.reset = async function () {
        me._groups = [];
        me._listing = {};
    };
    me.groups = async function (update = false) {
        var list = [];
        if (update || !me._groups || !me._groups.length) {
            list = me._groups = await me.storage.file.getChildren(me.rootPath, false);
        }
        else {
            list = me._groups;
        }
        return list;
    };
    me.listing = async function (path, update = false) {
        var files = null;
        if (update || !me._listing[path]) {
            files = await me.storage.file.getChildren(path);
            var oldListing = me._listing[path];
            me._listing[path] = files;
            for (var file of files) {
                var item = null;
                if (oldListing) {
                    item = oldListing[file.name];
                }
                if (item) {
                    file = Object.apply(file, item);
                }
                else {
                    file.path = path + "/" + file.name;
                    var metadata = await me.info(me.cachePath + "/" + file.name);
                    if (metadata) {
                        if (metadata.format) {
                            file.duration = metadata.format.duration;
                        }
                    }
                }
            }
        }
        else {
            files = me._listing[path];
        }
        return files;
    };
    me.updateListing = async function () {
        me.log("updateListing");
        var listing = await me.listing("/Kab/concepts/private/American", true);
        listing = listing.filter(item => {
            return me.core.path.extension(item.path) !== "mp4";
        });
        var diskSize = listing.reduce((total, item) => total + item.size, 0);
        me.log("Requires " + me.core.string.formatBytes(diskSize) + " Disk space for listing");
        for (var item of listing) {
            var target = "cache/" + me.core.path.fullName(item.path);
            var extension = me.core.path.extension(target);
            if (!item.downloaded) {
                try {
                    await me.manager.download.get(item.path, target);
                }
                catch (err) {
                    me.log_error("Failed to download: " + item.path);
                }
                item.downloaded = true;
            }
            if (extension === "m4a") {
                try {
                    if (!me.media.speech.transcribed(target)) {
                        me.log("transcribing: " + target);
                        await me.media.speech.transcribe(target);
                        var info = await me.manager.download.clean(me.tempDir, "flac");
                        me.log("cleaned cache, deleted: " + info.deleted + " failed: " + info.failed + " skipped: " + info.skipped);
                    }
                }
                catch (err) {
                    me.log_error("Failed to transcribe: " + target);
                }
            }
        }
        me.log("finished updateListing");
    };
    return "server";
};
