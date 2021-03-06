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
        me.handle = new me.dropbox({ accessToken: me.keys["access-token"], fetch: fetch });
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
        await me.iterate(service, entries, path, null, recursive);
        me.log("returning " + entries.length + " items for path: " + path + " recursive: " + recursive);
        return entries;
    };
    me.iterate = async function (service, entries, path, cursor, recursive) {
        var method = cursor ? "filesListFolderContinue" : "filesListFolder";
        const args = cursor ? { cursor } : { path };
        path = me.fixPath(path);
        var response = await service[method](args);
        entries.push(...response.entries);
        if (response.has_more) {
            await me.iterate(service, entries, path, response.cursor, recursive);
        } else if (recursive) {
            for (let item of response.entries) {
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
    me.downloadData = async function (path) {
        var service = await me.getService();
        path = me.fixPath(path);
        var result = await service.filesGetTemporaryLink({ path: path });
        var body = "";
        return new Promise((resolve, reject) => {
            me.https.get(result.link, res => {
                res.on("data", function (chunk) {
                    body += chunk;
                });
                res.on("close", function () {
                    resolve(body);
                });
                res.on("error", function (e) {
                    reject(e);
                });
            });
        });
    };
    me.uploadData = async function (path, data) {
        var service = await me.getService();
        path = me.fixPath(path);
        var response = await service.filesUpload({ path: path, contents: data });
        return response;
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
        var response = service.filesGetMetadata({ path });
        return response;
    };
    me.copyFile = async function (source, target) {
        var service = await me.getService();
        var from_path = me.fixPath(source);
        var to_path = me.fixPath(target);
        var response = await service.filesCopy({
            from_path,
            to_path
        });
        return response;
    };
    me.moveFile = async function (source, target) {
        var service = await me.getService();
        var from_path = me.fixPath(source);
        var to_path = me.fixPath(target);
        var response = await service.filesMove({
            from_path,
            to_path
        });
        return response;
    };
    me.deleteFile = async function (path) {
        const service = await me.getService();
        path = me.fixPath(path);
        var response = await service.filesDeleteV2({
            path
        });
        return response;
    };
    me.downloadFile = async function (from, to) {
        var path = me.fixPath(from);
        return new Promise(async (resolve, reject) => {
            var service = await me.getService();
            var result = await service.filesGetTemporaryLink({
                path
            });
            const req = me.https.get(result.link, res => {
                res.pipe(me.fs.createWriteStream(to));
            });
            req.on("close", resolve);
            req.on("error", reject);
        });
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
                            let result = await service.filesUploadSessionFinish({
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
                            let result = await service.filesUpload({
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
                        var response = await service.filesUploadSessionStart({
                            close: false,
                            contents: data
                        });
                    }
                    catch (err) {
                        me.log("failed to upload: " + to + " size: " + core.string.formatBytes(fileSize) + " err: " + JSON.stringify(err));
                        reject(err);
                        return;
                    }
                    cursor.session_id = response.session_id;
                    cursor.offset += data.length;
                    core.file.resume(fileSession);
                    me.log("uploading " + to + ":" + core.string.formatBytes(cursor.offset) + " / " + core.string.formatBytes(fileSize));
                }
            }, chunkSize);
        });
    };
    return "server";
};
