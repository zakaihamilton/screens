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
    };
    me.info = async function (path) {
        try {
            var metadata = await me.metadata.parseFile(path, { duration: true });
        }
        catch (err) {
            metadata = { path: path, error: err };
        }
        return metadata;
    };
    me.paths = function (groupName, path) {
        var paths = {
            local: me.cachePath + "/" + path,
            remote: me.rootPath + "/" + groupName + "/" + path
        };
        return paths;
    };
    me.download = async function (groupName, path) {
        var target = await me.manager.download.get(me.rootPath + "/" + groupName + "/" + path,
            me.cachePath + "/" + path);
        return target;
    };
    me.groups = async function (update = false) {
        var files = [];
        await me.core.util.performance(me.id + ".metadata", async () => {
            try {
                var unlock = await me.core.mutex.lock(me.id);
                files = await me.db.cache.file.listing(me.rootPath, update);
                for (let file of files) {
                    file.path = me.rootPath + "/" + file.name;
                    file.sessions = await me.listing(file, update);
                }
            }
            finally {
                unlock();
            }
        });
        return files;
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
    me.listing = async function (parent, update = false) {
        var files = await me.db.cache.file.listing(parent.path, update, async (file) => {
            file.group = parent.name;
            file.session = me.core.path.fileName(file.name);
            file.extension = me.core.path.extension(file.name);
            file.label = me.core.string.title(me.core.path.fileName(file.name));
            file.remote = parent.path + "/" + file.name;
            file.local = me.cachePath + "/" + file.name;
            if (file.local.endsWith(".m4a")) {
                try {
                    await me.manager.download.get(file.remote, file.local);
                }
                catch (err) {
                    me.log_error("Failed to download: " + file.remote);
                }
                var metadata = await me.info(file.local);
                if (metadata) {
                    if (metadata.format) {
                        file.duration = metadata.format.duration;
                        file.durationText = me.core.string.formatDuration(file.duration);
                    }
                }
            }
        });
        files.reverse();
        return files;
    };
    me.updateListing = async function () {
        me.log("updateListing");
        var groups = me.groups();
        var group = groups.find(item => item.name === "american");
        var listing = await me.listing(group, true);
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
