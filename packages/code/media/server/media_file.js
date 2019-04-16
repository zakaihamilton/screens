/*
 @author Zakai Hamilton
 @component MediaFile
 */

screens.media.file = function MediaFile(me, packages) {
    const { core, storage, media, db } = packages;
    me.resolutions = ["800x600", "1024x768"];
    me.rootPath = "/Kab/concepts/private";
    me.cachePath = "cache";
    me.awsBucket = "screens";
    me.init = function () {
        const ffprobePath = require("@ffprobe-installer/ffprobe").path;
        me.ffmpeg = require("fluent-ffmpeg");
        me.ffmpeg.setFfprobePath(ffprobePath);
        me.os = require("os");
        me.tempDir = me.os.tmpdir();
        core.file.makeDir(me.cachePath);
        core.mutex.enable(me.id, true);
        core.broadcast.register(me, {
            startup: "media.file.groups"
        });
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
            let result = false;
            file.group = parent.name;
            file.session = core.path.fileName(file.name);
            file.extension = core.path.extension(file.name);
            file.label = core.string.title(core.path.fileName(file.name));
            file.remote = parent.path + "/" + file.name;
            file.local = me.cachePath + "/" + file.name;
            let awsPath = me.awsBucket + "/" + parent.name + "/" + file.name;
            if (!await me.storage.aws.exists(awsPath)) {
                me.log("Downloading file: " + file.local + ", size: " + file.size);
                await me.manager.file.download(file.remote, file.local);
                me.log("Uploading file: " + file.local + ", size: " + file.size);
                await me.storage.aws.uploadFile(file.local, awsPath);
                if (file.local.endsWith(".m4a")) {
                    me.log("Retrieving metadata for file: " + file.local);
                    var metadata = await me.info(file.local);
                    if (metadata) {
                        if (metadata.format) {
                            file.duration = metadata.format.duration;
                            file.durationText = core.string.formatDuration(file.duration);
                            result = true;
                            me.log("Found metadata for file: " + file.local);
                        }
                    }
                }
                await core.file.delete(file.local);
                me.log("Deleted file: " + file.local);
                me.log("Finished uploading file: " + file.local);
            }
            let resolutions = Array.from(file.resolutions);
            delete file.resolutions;
            if (file.local.endsWith(".mp4")) {
                file.resolutions = [];
                for (let resolution of me.resolutions) {
                    let path = me.awsBucket + "/" + file.group + "/" + file.session + "_" + resolution + ".mp4";
                    if (await me.storage.aws.exists(path)) {
                        file.resolutions.push(resolution);
                        me.log("Found resolution " + resolution + " for file: " + path);
                    }
                    else {
                        let result = await me.convertItem(resolution, file.group, file.session);
                        if (result) {
                            file.resolutions.push(resolution);
                        }
                    }
                }
                if (file.resolutions.length === resolutions.length) {
                    result = true;
                }
            }
            return result;
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
                if (file.extension === "m4a") {
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
    me.streamingPath = function (group, name, extension, resolution) {
        let path = me.awsBucket + "/" + group + "/" + name + (resolution ? "_" + resolution : "") + "." + extension;
        return me.storage.aws.url(path);
    };
    me.convertItem = async function (resolution, group, session) {
        let result = false;
        try {
            var remote = me.awsBucket + "/" + group + "/" + session + ".mp4";
            var local = me.cachePath + "/" + session + ".mp4";
            var local_convert = me.cachePath + "/" + session + "_" + resolution + ".mp4";
            var remote_convert = me.awsBucket + "/" + group + "/" + session + "_" + resolution + ".mp4";
            if (!await core.file.exists(local_convert)) {
                if (!await core.file.exists(local)) {
                    me.log("downloading: " + remote + " to: " + local);
                    await storage.aws.downloadFile(remote, local);
                }
                me.log("converting: " + local + " to: " + local_convert);
                await media.ffmpeg.convert(local, local_convert, {
                    size: resolution
                });
            }
            me.log("uploading: " + local_convert + " to: " + remote_convert);
            await storage.aws.uploadFile(local_convert, remote_convert);
            me.log("deleting: " + local_convert);
            await core.file.delete(local_convert);
            me.log("deleting: " + local);
            await core.file.delete(local);
            me.log("finished: " + session);
            result = true;
        }
        catch (err) {
            me.log_error("Cannot convert session: " + session + " in group: " + group + " error: " + err);
        }
        return result;
    };
    me.convertListing = async function (resolution) {
        var groups = await me.groups();
        var servers = await me.db.events.servers.list({});
        var ipList = servers.map(server => server.ip).filter(Boolean);
        var results = [];
        var ip = null;
        me.log("found servers: " + ipList.join(", "));
        for (let group of groups) {
            var list = group.sessions.filter(session => session.extension === "mp4");
            for (let item of list) {
                var remote_convert = me.awsBucket + "/" + group.name + "/" + item.session + "_" + resolution + ".mp4";
                if (await storage.aws.exists(remote_convert)) {
                    continue;
                }
                let ipIndex = ipList.indexOf(ip);
                ip = (ipIndex < ipList.length - 1) ? ipList[ipIndex + 1] : ipList[0];
                await db.events.msg.sendTo(ip, "media.file.convertItem", resolution, group.name, item.session);
                results.push({ ip, group: group.name, session: item.session });
            }
        }
        return results;
    };
    return "server";
};
