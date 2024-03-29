/*
 @author Zakai Hamilton
 @component MediaFile
 */

screens.media.file = function MediaFile(me, { core, storage, media, db, manager, cache }) {
    me.resolutions = [];
    me.rootPath = "/sessions";
    me.cachePath = "cache";
    me.init = function () {
        const ffprobePath = require("@ffprobe-installer/ffprobe").path;
        me.ffmpeg = require("fluent-ffmpeg");
        me.ffmpeg.setFfprobePath(ffprobePath);
        me.os = require("os");
        me.tempDir = me.os.tmpdir();
        core.file.makeDir(me.cachePath);
        core.mutex.enable(me.id, true);
    };
    me.awsPath = () => {
        return storage.aws.bucket + "/sessions";
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
    me.cdn = function () {
        return storage.aws.cdn;
    };
    me.bucket = function () {
        return storage.aws.bucket;
    };
    me.download = async function (groupName, name) {
        const [, year] = name.match(/([0-9]*)-.*/);
        var target = await manager.file.download(me.rootPath + "/" + groupName + "/" + year + "/" + name,
            me.cachePath + "/" + name);
        return target;
    };
    me.pullLatest = async function () {
        await db.events.msg.sendParallel([["storage.fs.delete", "server/metadata"]]);
        var groups = await db.cache.file.listing(me.rootPath, true);
        for (const group of groups) {
            group.path = me.rootPath + "/" + group.name;
            const years = await db.cache.file.listing(me.rootPath + "/" + group.name, true);
            let sessions = [];
            for (const year of years) {
                year.path = me.rootPath + "/" + group.name + "/" + year.name;
                sessions.push(...await me.listing(year, group.name, true));
            }
            sessions = sessions.sort((a, b) => a.label.localeCompare(b.label));
            sessions.map(item => {
                ["is_downloadable",
                    "content_hash",
                    ".tag",
                    "path_lower",
                    "path_display",
                    "_id",
                    "client_modified",
                    "server_modified",
                    "rev"].map(key => delete item[key]);
            });
            sessions.reverse();
            group.sessions = sessions;
        }
        groups = groups.sort((a, b) => a.name.localeCompare(b.name));
        const folders = [];
        for (const group of groups) {
            const { sessions } = group;
            for (const session of sessions) {
                const { session: name, folder, duration, size } = session;
                let folderEntry = folders.find(item => item.path === folder);
                if (!folderEntry) {
                    folderEntry = { path: folder, sessions: [] };
                    folders.push(folderEntry);
                }
                let sessionEntry = folderEntry.sessions.find(item => item.name === name);
                if (!sessionEntry) {
                    sessionEntry = { name, duration, size };
                    folderEntry.sessions.push(sessionEntry);
                }
                if (duration) {
                    sessionEntry.duration = duration;
                }
                if (size) {
                    sessionEntry.size = size;
                }
            }
        }
        for (const folder of folders) {
            await storage.aws.uploadData("screens" + folder.path + "/metadata.json", JSON.stringify(folder.sessions, null, 4));
        }
        return groups;
    };
    me.listing = async function (parent, group, update = false) {
        let argList = [];
        await media.sessions.getPaths();
        var files = await db.cache.file.listing(parent.path, update, async (file) => {
            let result = false;
            file.group = group;
            file.session = core.path.fileName(file.name);
            file.extension = core.path.extension(file.name);
            file.label = core.string.title(core.path.fileName(file.name));
            Object.assign(file, media.sessions.paths(group, file.name));
            let deleteFile = false;
            let downloadFile = false;
            let uploadFile = false;
            let retriveMetadata = file.local.endsWith(".m4a") && (!file.duration || !file.durationText);
            if (retriveMetadata) {
                downloadFile = true;
            }
            if (!await storage.aws.exists(file.aws)) {
                downloadFile = true;
                uploadFile = true;
            }
            console.log("managing file: " + file.local + " download: " + downloadFile + " upload: " + uploadFile + " retriveMetadata: " + retriveMetadata);
            if (downloadFile) {
                try {
                    me.log("Downloading file: '" + file.local + "' remote: '" + file.remote + "' size: " + file.size);
                    await manager.file.download(file.remote, file.local);
                    const size = await core.file.size(file.local);
                    if (size !== file.size) {
                        throw new Error("file size mismatch between size " + size + " and " + file.size + " for file: " + file.local);
                    }
                    me.log("downloaded file", file.local);
                    deleteFile = true;
                }
                catch (err) {
                    console.error("error downloading file: " + file.local + " error: " + err);
                    throw err;
                }
            }
            if (uploadFile) {
                try {
                    me.log("Uploading file: " + file.local + ", size: " + file.size);
                    await storage.aws.uploadFile(file.local, file.aws);
                    me.log("Uploaded file: " + file.local);
                    const metadata = await storage.aws.metadata(file.aws);
                    if (metadata.size !== file.size) {
                        throw new Error("file size mismatch between size " + metadata.size + " and " + file.size + " for file: " + file.aws);
                    }
                    result = true;
                }
                catch (err) {
                    console.error("error uploading file: " + file.local + " error: " + err);
                    throw err;
                }
            }
            if (retriveMetadata) {
                me.log("Retrieving metadata for file: " + file.local);
                try {
                    var metadata = await me.info(file.local);
                    if (metadata) {
                        if (metadata.format && metadata.format.duration) {
                            file.duration = metadata.format.duration;
                            file.durationText = core.string.formatDuration(file.duration);
                            me.log("Found metadata for file: " + file.local + " duration: " + file.durationText);
                            result = true;
                        }
                    }
                }
                catch (err) {
                    console.error("error retrieving metadata for file: " + file.local + " error: " + err);
                    throw err;
                }
            }
            if (deleteFile) {
                me.log("Deleting file: " + file.local);
                await core.file.delete(file.local);
                me.log("Deleted file: " + file.local);
            }
            if (file.local.endsWith(".mp4")) {
                const [, year] = file.session.match(/([0-9]*)-.*/);
                let resolutions = [];
                for (let resolution of me.resolutions) {
                    let path = me.awsPath() + "/" + file.group + "/" + year + "/" + file.session + "_" + resolution + ".mp4";
                    if (await storage.aws.exists(path)) {
                        resolutions.push(resolution);
                    }
                    else {
                        argList.push(["media.file.convertItem", file.group, file.session, resolution]);
                        resolutions.push(resolution);
                    }
                }
                argList.push(["media.file.screenshot", file.group, file.session]);
                if ((!file.resolutions && resolutions.length) || (file.resolutions && file.resolutions.length) !== resolutions.length) {
                    file.resolutions = resolutions;
                    result = true;
                }
            }
            return result;
        });
        if (argList.length) {
            await db.events.msg.sendParallel(argList);
        }
        files.reverse();
        return files;
    };
    me.size = async function () {
        var info = { groups: {}, total: 0, count: 0 };
        var groups = await me.pullLatest();
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
        var groups = await me.pullLatest();
        for (let group of groups) {
            var files = group.sessions;
            var diskSize = files.reduce((total, item) => total + item.size, 0);
            me.log("Requires " + core.string.formatBytes(diskSize) + " Disk space for files");
            for (var file of files) {
                if (file.extension === "m4a") {
                    try {
                        if (!await media.speech.exists(file.local)) {
                            me.log("transcribing: " + file.local);
                            await media.speech.transcribe(file.local);
                            var info = await manager.download.clean(me.tempDir, "flac");
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
    me.streamingPath = async function (group, name, extension, resolution) {
        if (!name) {
            return null;
        }
        const [, year] = name.match(/([0-9]*)-.*/);
        let path = me.awsPath() + "/" + group + "/" + year + "/" + name + (resolution ? "_" + resolution : "") + "." + extension;
        if (!storage.aws.exists(path)) {
            path = me.awsPath() + "/" + group + "/" + year + "/" + name + "." + extension;
        }
        if (!storage.aws.exists(path)) {
            return null;
        }
        let stream = await db.shared.stream.find({ user: this.userName, group, session: name }) || {};
        await db.shared.stream.use({ user: this.userName, group, session: name }, { ...stream, userId: this.userId, date: new Date().toString() });
        return storage.aws.url(path);
    };
    me.streamingList = async function (group, name) {
        var records = await db.shared.stream.list({ group, session: name });
        var users = records.map(record => record.user);
        return users;
    };
    me.screenshot = async function (group, session) {
        let result = false;
        try {
            const from_ext = ".mp4", to_ext = ".png";
            const [, year] = session.match(/([0-9]*)-.*/);
            var remote = me.awsPath() + "/" + group + "/" + year + "/" + session + from_ext;
            var local = me.cachePath + "/" + session + from_ext;
            var local_convert = me.cachePath + "/" + session + to_ext;
            var remote_convert = me.awsPath() + "/" + group + "/" + year + "/" + session + to_ext;
            if (await storage.aws.exists(remote_convert)) {
                me.log("already converted: " + remote_convert);
                return false;
            }
            if (!await core.file.exists(local_convert)) {
                if (!await core.file.exists(local)) {
                    await db.events.state.set(me.id, session, "download", {
                        from: remote,
                        to: local
                    });
                    me.log("downloading: " + remote + " to: " + local);
                    await storage.aws.downloadFile(remote, local);
                }
                me.log("converting: " + local + " to: " + local_convert);
                await db.events.state.set(me.id, session, "screenshot", {
                    from: remote,
                    to: local_convert
                });
                try {
                    await media.ffmpeg.convert(local, local_convert, {
                        seek: "0:05"
                    }, async (percent) => {
                        await db.events.state.set(me.id, session, "screenshot", {
                            from: local,
                            to: local_convert,
                            percent
                        });
                    });
                }
                catch (err) {
                    if (!await core.file.exists(local_convert)) {
                        me.log_error("Cannot convert session: " + session + " in group: " + group + " error: " + err);
                        await db.events.state.set(me.id, session, "error", {
                            error: err
                        });
                        try {
                            await core.file.delete(local);
                            await core.file.delete(local_convert);
                        }
                        // eslint-disable-next-line no-empty
                        catch (err) {

                        }
                    }
                }
            }
            me.log("uploading: " + local_convert + " to: " + remote_convert);
            await db.events.state.set(me.id, session, "upload", {
                from: local_convert,
                to: remote_convert
            });
            await storage.aws.uploadFile(local_convert, remote_convert);
            me.log("deleting: " + local_convert);
            await core.file.delete(local_convert);
            me.log("deleting: " + local);
            await core.file.delete(local);
            me.log("finished screenshot: " + session);
            await db.events.state.set(me.id, session);
            cache.listing.updateAll("aws/" + me.awsPath() + "/" + group + "/" + year);
            result = true;
        }
        catch (err) {
            me.log_error("Cannot convert session: " + session + " in group: " + group + " error: " + err);
            await db.events.state.set(me.id, session, "error", {
                error: err
            });
            try {
                await core.file.delete(local);
                await core.file.delete(local_convert);
            }
            // eslint-disable-next-line no-empty
            catch (err) {

            }
        }
        return result;
    };
    me.convertItem = async function (group, session, resolution) {
        let result = false;
        try {
            var extension = ".mp4";
            const [, year] = session.match(/([0-9]*)-.*/);
            var remote = me.awsPath() + "/" + group + "/" + year + "/" + session + extension;
            var local = me.cachePath + "/" + session + extension;
            var local_convert = me.cachePath + "/" + session + "_" + resolution + extension;
            var remote_convert = me.awsPath() + "/" + group + "/" + year + "/" + session + "_" + resolution + extension;
            if (await storage.aws.exists(remote_convert)) {
                me.log("already converted: " + remote_convert);
                return false;
            }
            if (!await core.file.exists(local_convert)) {
                if (!await core.file.exists(local)) {
                    await db.events.state.set(me.id, session, "download", {
                        from: remote,
                        to: local
                    });
                    me.log("downloading: " + remote + " to: " + local);
                    await storage.aws.downloadFile(remote, local);
                }
                me.log("converting: " + local + " to: " + local_convert);
                await db.events.state.set(me.id, session, "convert", {
                    from: remote,
                    to: local_convert,
                    resolution
                });
                await media.ffmpeg.convert(local, local_convert, {
                    size: resolution,
                }, async (percent) => {
                    await db.events.state.set(me.id, session, "convert", {
                        from: local,
                        to: local_convert,
                        percent
                    });
                });
            }
            me.log("uploading: " + local_convert + " to: " + remote_convert);
            await db.events.state.set(me.id, session, "upload", {
                from: local_convert,
                to: remote_convert
            });
            await storage.aws.uploadFile(local_convert, remote_convert);
            me.log("deleting: " + local_convert);
            await core.file.delete(local_convert);
            me.log("deleting: " + local);
            await core.file.delete(local);
            me.log("finished: " + session);
            await db.events.state.set(me.id, session);
            cache.listing.updateAll("aws/" + me.awsPath() + "/" + group + "/" + year);
            result = true;
        }
        catch (err) {
            me.log_error("Cannot convert session: " + session + " in group: " + group + " error: " + err);
            await db.events.state.set(me.id, session, "error", {
                error: err
            });
            try {
                await core.file.delete(local);
                await core.file.delete(local_convert);
            }
            // eslint-disable-next-line no-empty
            catch (err) {

            }
        }
        return result;
    };
    me.convertListing = async function (resolution) {
        if (!resolution) {
            for (resolution of me.resolutions) {
                await me.convertListing(resolution);
            }
            await me.convertListing("screenshot");
            return;
        }
        var groups = await me.pullLatest();
        var argList = [];
        for (let group of groups) {
            var list = group.sessions.filter(session => session.extension === "mp4");
            me.log("Checking listing for group: " + group.name + " to convert to resolution: " + resolution + " out of " + list.length + " items");
            await Promise.all(list.map(async item => {
                const [, year] = item.session.match(/([0-9]*)-.*/);
                if (resolution === "screenshot") {
                    const remote_convert = me.awsPath() + "/" + group.name + "/" + year + "/" + item.session + ".png";
                    if (await storage.aws.exists(remote_convert)) {
                        return;
                    }
                    argList.push(["media.file.screenshot", group.name, item.session]);
                }
                else {
                    const remote_convert = me.awsPath() + "/" + group.name + "/" + year + "/" + item.session + "_" + resolution + ".mp4";
                    if (await storage.aws.exists(remote_convert)) {
                        return;
                    }
                    argList.push(["media.file.convertItem", group.name, item.session, resolution]);
                }
            }));
        }
        await db.events.msg.sendParallel(argList);
    };
    me.convertListingQuery = async function (resolution) {
        if (!resolution) {
            for (resolution of me.resolutions) {
                await me.convertListingQuery(resolution);
            }
            await me.convertListingQuery("screenshot");
            return;
        }
        var groups = await me.pullLatest();
        var argList = [];
        for (let group of groups) {
            let count = 0;
            var list = group.sessions.filter(session => session.extension === "mp4");
            me.log("Checking listing for group: " + group.name + " to convert to resolution: " + resolution + " out of " + list.length + " items");
            await Promise.all(list.map(async item => {
                const [, year] = item.session.match(/([0-9]*)-.*/);
                await core.util.sleep(100);
                if (resolution === "screenshot") {
                    const remote_convert = me.awsPath() + "/" + group.name + "/" + year + "/" + item.session + ".png";
                    if (await storage.aws.exists(remote_convert)) {
                        return;
                    }
                    argList.push(["media.file.screenshot", group.name, item.session]);
                    count++;
                }
                else {
                    const remote_convert = me.awsPath() + "/" + group.name + "/" + year + "/" + item.session + "_" + resolution + ".mp4";
                    if (await storage.aws.exists(remote_convert)) {
                        return;
                    }
                    argList.push(["media.file.convertItem", group.name, item.session, resolution]);
                    count++;
                }
            }));
            me.log("Convert listing count for group: " + group.name + " is: " + count + " items out of " + list.length + " items");
        }
        me.log("Total number of items to convert: " + argList.length);
        return argList;
    };
    return "server";
};
