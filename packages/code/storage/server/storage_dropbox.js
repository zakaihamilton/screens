/*
 @author Zakai Hamilton
 @component StorageDropBox
 */

screens.storage.dropbox = function StorageDropBox(me, { core }) {
    me.init = async function () {
        require("es6-promise").polyfill();
        me.dropbox = require("dropbox").Dropbox;
        me.fs = require("fs");
        me.https = require("https");
        me.keys = await core.private.keys("dropbox");
    };
    me.getService = async function () {
        if (me.handle) {
            return me.handle;
        }
        var fetch = require("isomorphic-fetch");
        if (!me.keys["refresh-token"] || !me.keys["app-key"] || !me.keys["app-secret"]) {
            console.error("Dropbox keys are not configured for the refresh token flow.");
            throw new Error("Missing Dropbox app-key, app-secret, or refresh-token.");
        }
        me.handle = new me.dropbox({
            refreshToken: me.keys["refresh-token"],
            clientId: me.keys["app-key"],
            clientSecret: me.keys["app-secret"],
            fetch: fetch
        });
        return me.handle;
    };
    me.fixPath = function (path) {
        if (path === "/") {
            return "";
        }
        return path;
    };
    me.getChildren = async function (path, recursive = false) {
        me.log("requesting items for path: " + path + " recursive: " + recursive);
        var entries = [];
        var service = await me.getService();
        try {
            await me.iterate(service, entries, path, null, recursive);
            me.log("returning " + entries.length + " items for path: " + path + " recursive: " + recursive);
        }
        catch (err) {
            me.log("failed to get items for path: " + path + " recursive: " + recursive + " err" + err);
            throw err;
        }
        return entries;
    };
    me.iterate = async function (service, entries, path, cursor, recursive) {
        var method = cursor ? "filesListFolderContinue" : "filesListFolder";
        const args = cursor ? { cursor } : { path };
        path = me.fixPath(path);
        var { result } = await service[method](args);
        entries.push(...result.entries);
        if (result.has_more) {
            await me.iterate(service, entries, path, result.cursor, recursive);
        } else if (recursive) {
            for (let item of result.entries) {
                if (item[".tag"] !== "folder") {
                    continue;
                }
                await me.iterate(service, entries, item.path_lower, null, recursive);
            }
        }
    };
    me.createFolder = async function (path) {
        var service = await me.getService();
        path = me.fixPath(path);
        var folderRef = service.filesCreateFolder({ path: path, autorename: false });
        return folderRef;
    };
    me.downloadFile = async function (from, to) {
        const path = me.fixPath(from);
        const service = await me.getService();
        const { result } = await service.filesGetTemporaryLink({ path });
        const url = result.link;

        return new Promise((resolve, reject) => {
            let downloadedSize = 0;
            let totalSize = 0;
            let timerHandle = null;

            const writeStream = me.fs.createWriteStream(to);

            const req = me.https.get(url, { method: "GET" }, (res) => {
                if (res.statusCode !== 200 && res.statusCode !== 206) {
                    reject(new Error("Failed to download file: " + from + ", status code: " + res.statusCode));
                    return;
                }

                if (res.headers["content-range"]) {
                    const contentRange = res.headers["content-range"].split("/");
                    totalSize = parseInt(contentRange[1]);
                } else {
                    totalSize = parseInt(res.headers["content-length"]);
                }

                res.on("data", (chunk) => {
                    downloadedSize += chunk.length;
                    // Progress tracking: Calculate percentage and display progress
                    const progress = (downloadedSize / totalSize) * 100;
                    if (!timerHandle) {
                        timerHandle = setTimeout(() => {
                            timerHandle = null;
                            console.log("Downloading: " + progress.toFixed(2) + "%");
                        }, 1000);
                    }
                });

                res.on("end", () => {
                    console.log("Download completed");
                    writeStream.end(); // Close the write stream after download is complete
                    resolve();
                });

                res.on("error", (err) => {
                    writeStream.end();
                    reject(new Error("Failed to download file: " + from + ", error: " + err.message));
                });

                res.pipe(writeStream);
            });

            req.on("error", (err) => {
                writeStream.end();
                reject(new Error("Failed to download file: " + from + ", error: " + err.message));
            });

            // Add a timeout to prevent the process from hanging indefinitely
            req.setTimeout(30000, () => {
                req.abort();
                writeStream.end();
                reject(new Error("Download timed out"));
            });

            req.end(); // Initiate the request
        });
    };
    me.uploadData = async function (path, data) {
        var service = await me.getService();
        path = me.fixPath(path);
        var { result } = await service.filesUpload({ path: path, contents: data });
        return result;
    };
    me.metadata = async function (path) {
        if (!path || path === "/") {
            return {
                ".tag": "folder",
                name: ""
            };
        }
        var service = await me.getService();
        path = me.fixPath(path);
        var { result } = service.filesGetMetadata({ path });
        return result;
    };
    me.copyFile = async function (source, target) {
        var service = await me.getService();
        var from_path = me.fixPath(source);
        var to_path = me.fixPath(target);
        var { result } = await service.filesCopy({
            from_path,
            to_path
        });
        return result;
    };
    me.moveFile = async function (source, target) {
        var service = await me.getService();
        var from_path = me.fixPath(source);
        var to_path = me.fixPath(target);
        var { result } = await service.filesMove({
            from_path,
            to_path
        });
        return result;
    };
    me.deleteFile = async function (path) {
        const service = await me.getService();
        path = me.fixPath(path);
        var { result } = await service.filesDeleteV2({
            path
        });
        return result;
    };
    me.uploadFile = async function (from, to, progressCallback) {
        var service = await me.getService();
        var fileSize = await core.file.size(from);
        var fileSession = core.file.open(from);
        var cursor = { session_id: null, offset: 0 };
        return new Promise((resolve, reject) => {
            const chunkSize = 8 * 1000 * 1000;
            core.file.read(fileSession, async data => {
                if (!data) {
                    return;
                }
                if (progressCallback) {
                    progressCallback(cursor.offset, fileSize);
                }
                if (cursor.offset + data.length >= fileSize) {
                    if (cursor.offset) {
                        var commit = { path: to, mode: "overwrite", mute: false };
                        try {
                            let { result } = await service.filesUploadSessionFinish({
                                cursor: cursor,
                                commit: commit,
                                contents: data
                            });
                            me.log("finished uploading in parts: " + to + " size: " + core.string.formatBytes(fileSize) + " result: " + result);
                            resolve();
                        }
                        catch (err) {
                            me.log("failed to upload in parts: " + to + " size: " + core.string.formatBytes(fileSize) + " err: " + JSON.stringify(err));
                            reject(err);
                        }
                    }
                    else {
                        try {
                            let { result } = await service.filesUpload({
                                path: to,
                                contents: data
                            });
                            me.log("finished uploading: " + to + " size: " + core.string.formatBytes(fileSize) + " result: " + JSON.stringify(result));
                            resolve();
                        }
                        catch (err) {
                            me.log("failed to upload: " + to + " size: " + core.string.formatBytes(fileSize) + " err: " + JSON.stringify(err));
                            reject(err);
                        }
                    }
                    return;
                }
                else if (cursor.offset) {
                    core.file.pause(fileSession);
                    try {
                        await service.filesUploadSessionAppendV2({
                            cursor: cursor,
                            close: false,
                            contents: data
                        });
                    }
                    catch (err) {
                        me.log("failed to upload: " + to + " size: " + core.string.formatBytes(fileSize) + " err: " + JSON.stringify(err));
                        reject(err);
                        return;
                    }
                    cursor.offset += data.length;
                    core.file.resume(fileSession);
                    me.log("uploading " + to + ":" + core.string.formatBytes(cursor.offset) + " / " + core.string.formatBytes(fileSize));
                }
                else {
                    core.file.pause(fileSession);
                    try {
                        var { result } = await service.filesUploadSessionStart({
                            close: false,
                            contents: data
                        });
                    }
                    catch (err) {
                        me.log("failed to upload: " + to + " size: " + core.string.formatBytes(fileSize) + " err: " + JSON.stringify(err));
                        reject(err);
                        return;
                    }
                    cursor.session_id = result.session_id;
                    cursor.offset += data.length;
                    core.file.resume(fileSession);
                    me.log("uploading " + to + ":" + core.string.formatBytes(cursor.offset) + " / " + core.string.formatBytes(fileSize));
                }
            }, chunkSize);
        });
    };
    return "server";
};
