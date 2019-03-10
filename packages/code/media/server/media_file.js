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
    me.groups = async function (update = false, video = false) {
        var files = [];
        try {
            var unlock = await core.mutex.lock(me.id);
            files = await me.db.cache.file.listing(me.rootPath, update);
            for (let file of files) {
                file.path = me.rootPath + "/" + file.name;
                var sessions = await me.listing(file, update, video);
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
    me.listing = async function (parent, update = false, video = false) {
        var files = await me.db.cache.file.listing(parent.path, update, async (file) => {
            file.group = parent.name;
            file.session = core.path.fileName(file.name);
            file.extension = core.path.extension(file.name);
            file.label = core.string.title(core.path.fileName(file.name));
            file.remote = parent.path + "/" + file.name;
            file.local = me.cachePath + "/" + file.name;
            if (file.local.endsWith(".m4a") || (video && file.local.endsWith(".mp4"))) {
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
    me.size = async function () {
        var info = { groups: {}, total: 0, count: 0 };
        var groups = await me.groups(true, true);
        for (let group of groups) {
            var files = group.sessions;
            ["m4a", "mp4"].map(extension => {
                let list = files.filter(file => file.extension === extension);
                var diskSize = list.reduce((total, item) => total + item.size, 0);
                let infoGroup = info.groups[group.name];
                if (!infoGroup) {
                    infoGroup = info.groups[group.name] = { total: 0, count: 0 };
                }
                infoGroup.total += diskSize;
                infoGroup.count += list.length;
                info.total += diskSize;
                info.total += list.length;
            });
        }
        for (let infoName in info.groups) {
            let group = info.groups[infoName];
            for (let key in group) {
                if (key === "total") {
                    continue;
                }
                group[key].total = core.string.formatBytes(group[key].total);
            }
            group.total = core.string.formatBytes(group.total);
        }
        info.total = core.string.formatBytes(info.total);
        return info;
    };
    me.updateListing = async function () {
        me.log("updateListing");
        var groups = await me.groups(true, true);
        for (let group of groups) {
            var files = group.sessions;
            var diskSize = files.reduce((total, item) => total + item.size, 0);
            me.log("Requires " + core.string.formatBytes(diskSize) + " Disk space for files");
            for (var file of files) {
                let awsPath = "screens/" + group.name + "/" + file.name;
                if (!await me.storage.aws.exists(awsPath)) {
                    me.log("Downloading file: " + file.local + ", size: " + file.size);
                    await me.manager.file.download(file.remote, file.local);
                    me.log("Uploading file: " + file.local + ", size: " + file.size);
                    await me.storage.aws.uploadFile(file.local, awsPath);
                    if (file.extension === "mp4") {
                        await core.file.delete(file.local);
                        me.log("Deleted file: " + file.local);
                    }
                    me.log("Finished uploading file: " + file.local);
                }
                if (false && file.extension === "m4a") {
                    try {
                        if (!me.media.speech.exists(file.local)) {
                            me.log("transcribing: " + file.local);
                            await me.media.speech.transcribe(file.local);
                            var info = await me.manager.download.clean(me.tempDir, "flac");
                            me.log("cleaned cache, deleted: " + info.deleted + " failed: " + info.failed + " skipped: " + info.skipped);
                        }
                    }
                    catch (err) {
                        me.log_error("Failed to transcribe: " + file.local);
                    }
                }
            }
        }
        me.log("finished update");
    };
    return "server";
};
