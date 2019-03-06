/*
 @author Zakai Hamilton
 @component MediaFile
 */

screens.media.file = function MediaFile(me, packages) {
    const { core } = packages;
    me.rootPath = "/Kab/concepts/private";
    me.cachePath = "cache";
    me.init = function () {
        const ffprobePath = require("@ffprobe-installer/ffprobe").path;
        me.ffmpeg = require("fluent-ffmpeg");
        me.ffmpeg.setFfprobePath(ffprobePath);
        me.os = require("os");
        me.tempDir = me.os.tmpdir();
        if (!core.file.exists(me.cachePath)) {
            core.file.makeDir(me.cachePath);
        }
        core.mutex.enable(me.id, true);
    };
    me.info = function (path) {
        return new Promise(resolve => {
            me.ffmpeg.ffprobe(path, function (err, info) {
                if (err) {
                    me.log_error("Cannot parse metadata for file: " + path + " error: " + err);
                    info = null;
                }
                resolve(info);
            });
        });
    };
    me.paths = function (groupName, path) {
        var paths = {
            local: me.cachePath + "/" + path,
            remote: me.rootPath + "/" + groupName + "/" + path
        };
        return paths;
    };
    me.download = async function (groupName, path) {
        var target = await me.manager.file.download(me.rootPath + "/" + groupName + "/" + path,
            me.cachePath + "/" + path);
        return target;
    };
    me.groups = async function (update = false) {
        var files = [];
        try {
            var unlock = await core.mutex.lock(me.id);
            files = await me.db.cache.file.listing(me.rootPath, update);
            for (let file of files) {
                file.path = me.rootPath + "/" + file.name;
                var sessions = await me.listing(file, update);
                sessions = sessions.sort((a, b) => a.label.localeCompare(b.label));
                sessions.reverse();
                file.sessions = sessions;
            }
            files = files.sort((a, b) => a.name.localeCompare(b.name));
            files.sort();
        }
        finally {
            unlock();
        }
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
            file.session = core.path.fileName(file.name);
            file.extension = core.path.extension(file.name);
            file.label = core.string.title(core.path.fileName(file.name));
            file.remote = parent.path + "/" + file.name;
            file.local = me.cachePath + "/" + file.name;
            if (file.local.endsWith(".m4a")) {
                try {
                    await me.manager.file.download(file.remote, file.local);
                }
                catch (err) {
                    me.log_error("Failed to download: " + file.remote);
                }
                var metadata = await me.info(file.local);
                if (metadata) {
                    if (metadata.format) {
                        file.duration = metadata.format.duration;
                        file.durationText = core.string.formatDuration(file.duration);
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
            return core.path.extension(item.name) === "m4a";
        });
        var diskSize = listing.reduce((total, item) => total + item.size, 0);
        me.log("Requires " + core.string.formatBytes(diskSize) + " Disk space for listing");
        for (var item of listing) {
            var target = "cache/" + core.path.fullName(item.path);
            var extension = core.path.extension(target);
            if (!item.downloaded) {
                try {
                    await me.manager.file.download(item.path, target);
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
