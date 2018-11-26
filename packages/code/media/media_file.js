/*
 @author Zakai Hamilton
 @component MediaFile
 */

screens.media.file = function MediaFile(me) {
    me.cachePath = "cache";
    me.init = function () {
        me.metadata = require("music-metadata");
        me.core.task.push("media.file.updateListing", 300000);
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
        var listing = await me.listing("/Kab/concepts/private/American", true);
        for (var item of listing) {
            var target = "cache/" + me.core.path.fullName(item.path);
            var extension = me.core.path.extension(target);
            if (extension === "mp4") {
                continue;
            }
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
                    }
                }
                catch (err) {
                    me.log_error("Failed to transcribe: " + target);
                }
            }
        }
    };
    return "server";
};
