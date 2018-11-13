/*
 @author Zakai Hamilton
 @component StorageFile
 */

screens.storage.file = function StorageFile(me) {
    me.init = function () {
        require("es6-promise").polyfill();
        me.dropbox = require("dropbox").Dropbox;
        me.fs = require("fs");
        me.https = require('https');
    };
    me.getService = async function () {
        if (me.service) {
            return me.service;
        }
        var fetch = require("isomorphic-fetch");
        var keys = await me.core.private.keys("dropbox");
        me.service = new me.dropbox({ accessToken: keys['access-token'], fetch: fetch });
        return me.service;
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
        path = me.fixPath(path);
        var response = await service[method]({ path: path });
        entries.push(...response.entries);
        if (response.has_more) {
            await me.iterate(service, entries, path, response.cursor, recursive);
        } else if (recursive) {
            for (let item of response.entries) {
                if (item[".tag"] !== "folder") {
                    continue;
                }
                item.entries = [];
                await me.iterate(service, item.entries, item.path_lower, null, recursive);
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
        var service = await me.getService();
        path = me.fixPath(path);
        var response = service.filesGetMetadata({ path: path });
        return response;
    };
    me.downloadFile = async function (from, to) {
        var service = await me.getService();
        var path = me.fixPath(from);
        var result = await service.filesGetTemporaryLink({ path: path });
        const req = me.https.get(result.link, res => {
            res.pipe(me.fs.createWriteStream(to));
        });
        return new Promise((resolve, reject) => {
            req.on('close', function () {
                resolve();
            });
            req.on('error', function (e) {
                reject(e);
            });
        });
    };
    me.uploadFile = async function (from, to, progressCallback) {
        const UPLOAD_FILE_SIZE_LIMIT = 150 * 1024 * 1024;
        var service = await me.getService();
        var fileSize = await me.core.file.size(from);
        var fileSession = me.core.file.open(from);
        var cursor = { session_id: null, offset: 0 };
        return new Promise((resolve, reject) => {
            const chunkSize = 8 * 1000 * 1000;
            me.core.file.read(fileSession, async data => {
                if (!data) {
                    return;
                }
                if (progressCallback) {
                    progressCallback(cursor.offset, fileSize);
                }
                if (cursor.offset + data.length >= fileSize) {
                    if (cursor.offset) {
                        var commit = { path: to, mode: 'overwrite', mute: false };
                        try {
                            var result = await service.filesUploadSessionFinish({
                                cursor: cursor,
                                commit: commit,
                                contents: data
                            });
                            me.log("finished uploading in parts: " + to + " size: " + fileSize + " result: " + result);
                            resolve();
                        }
                        catch (err) {
                            me.log("failed to upload in parts: " + to + " size: " + fileSize + " err: " + JSON.stringify(err));
                            reject(err);
                        }
                    }
                    else {
                        try {
                            var result = await service.filesUpload({
                                path: to,
                                contents: data
                            });
                            me.log("finished uploading: " + to + " size: " + fileSize + " result: " + JSON.stringify(result));
                            resolve();
                        }
                        catch (err) {
                            me.log("failed to upload: " + to + " size: " + fileSize + " err: " + JSON.stringify(err));
                            reject(err);
                        }
                    }
                    return;
                }
                else if (cursor.offset) {
                    me.core.file.pause(fileSession);
                    try {
                        await service.filesUploadSessionAppendV2({
                            cursor: cursor,
                            close: false,
                            contents: data
                        });
                    }
                    catch (err) {
                        me.log("failed to upload: " + to + " size: " + fileSize + " err: " + JSON.stringify(err));
                        reject(err);
                        return;
                    }
                    cursor.offset += data.length;
                    me.core.file.resume(fileSession);
                    me.log("uploading: " + cursor.offset + " / " + fileSize);
                }
                else {
                    me.core.file.pause(fileSession);
                    try {
                        var response = await service.filesUploadSessionStart({
                            close: false,
                            contents: data
                        });
                    }
                    catch (err) {
                        me.log("failed to upload: " + to + " size: " + fileSize + " err: " + JSON.stringify(err));
                        reject(err);
                        return;
                    }
                    cursor.session_id = response.session_id;
                    cursor.offset += data.length;
                    me.core.file.resume(fileSession);
                    me.log("uploading: " + cursor.offset + " / " + fileSize);
                }
            }, chunkSize);
        });
    };
    return "server";
};

screens.storage.file.protocol = function StorageFileProtocol(me) {
    me.get = async function (path, format = "utf8") {
        var result = await me.core.file.protocol.get(path, format);
        if (result) {
            return result;
        }
        var pathInfo = me.core.object.pathInfo(path);
        var metadata = await me.upper.metadata("/" + pathInfo.direct);
        if (metadata[".tag"] === "folder") {
            var listing = await me.upper.getChildren("/" + pathInfo.direct);
            var folder = {};
            for (var item of listing) {
                var itemPath = pathInfo.virtual + "/" + item.name;
                var isFolder = item[".tag"] === "folder";
                var type = isFolder ? "folder" : "file";
                folder[item.name] = {
                    path: itemPath,
                    type: type,
                    name: item.name
                };
            }
            return folder;
        }
        else {
            var data = await me.upper.downloadData("/" + pathInfo.direct);
            return data;
        }
    };
    me.set = async function (path, data) {
        var result = await me.core.file.protocol.set(path, data);
        if (result) {
            return result;
        }
        var pathInfo = me.core.object.pathInfo(path);
        var metadata = await me.upper.metadata("/" + pathInfo.direct);
        if (metadata[".tag"] !== "folder") {
            result = await me.upper.uploadData("/" + pathInfo.direct, data);
            return result;
        }
    };
    return "server";
};
