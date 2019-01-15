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
        if (!me.core.file.exists(me.cachePath)) {
            me.core.file.makeDir(me.cachePath);
        }
        if (me.core.http.port === process.env.PORT) {
            me.core.task.push("media.file.updateListing", 1800000);
            me.updateListing();
        }
    };
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
    };
    me.path = function (groupName, path) {
        return me.cachePath + "/" + path;
    };
    me.download = async function (groupName, path) {
        var target = await me.manager.download.get(me.rootPath + "/" + groupName + "/" + path,
            me.cachePath + "/" + path);
        return target;
    };
    me.groups = async function (update = false) {
        try {
            var unlock = await me.core.mutex.lock();
            var list = [];
            if (update || !me._groups || !me._groups.length) {
                list = me._groups = await me.storage.file.getChildren(me.rootPath, false);
                for (var group of me._groups) {
                    group.path = me.rootPath + "/" + group.name;
                    await me.listing(group, update);
                }
            }
            else {
                list = me._groups;
            }
        }
        finally {
            unlock();
        }
        return list;
    };
    me.exists = async function (name) {
        var groups = await me.groups();
        for (var group of groups) {
            for (var session of group.sessions) {
                if (session.name.includes(name)) {
                    return group.name;
                }
            }
        }
        return null;
    };
    me.listing = async function (group, update = false) {
        var path = group.path;
        var files = [];
        if (update || !group.sessions) {
            files = await me.storage.file.getChildren(path);
            var oldListing = group.sessions;
            group.sessions = files.reverse();
            for (var file of files) {
                var item = null;
                if (oldListing) {
                    item = oldListing.find(item => item.name === file.name);
                }
                if (item) {
                    file = Object.assign(file, item);
                }
                else {
                    file.group = group.name;
                    file.session = me.core.path.fileName(file.name);
                    file.extension = me.core.path.extension(file.name);
                    file.label = me.core.string.title(me.core.path.fileName(file.name));
                    file.remote = path + "/" + file.name;
                    file.local = me.cachePath + "/" + file.name;
                    var metadata = await me.info(file.local);
                    if (metadata) {
                        if (metadata.format) {
                            file.duration = metadata.format.duration;
                            file.durationText = me.core.string.formatDuration(file.duration);
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
            return me.core.path.extension(item.name) === "m4a";
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
                    if (!me.media.speech.exists(target)) {
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
