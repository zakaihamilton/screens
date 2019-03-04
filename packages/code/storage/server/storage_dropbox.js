/*
 @author Zakai Hamilton
 @component StorageDropBox
 */

screens.storage.dropbox = function StorageDropBox(me) {
    me.init = function () {
        require("es6-promise").polyfill();
        me.dropbox = require("dropbox").Dropbox;
        me.fs = require("fs");
        me.https = require("https");
    };
    me.getService = async function () {
        if (me.handle) {
            return me.handle;
        }
        var fetch = require("isomorphic-fetch");
        var keys = await me.core.private.keys("dropbox");
        me.handle = new me.dropbox({ accessToken: keys["access-token"], fetch: fetch });
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
        var service = await me.getService();
        path = me.fixPath(path);
        var response = service.filesGetMetadata({ path: path });
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
    me.downloadFile = async function (from, to) {
        var service = await me.getService();
        var path = me.fixPath(from);
        var result = await service.filesDownload({ path: path });
        if (!result.fileBinary) {
            throw "No binary content for file: " + path;
        }
        await me.core.file.writeFile(to, result.fileBinary, "binary");
    };
    me.uploadFile = async function (from, to, progressCallback) {
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
                        var commit = { path: to, mode: "overwrite", mute: false };
                        try {
                            let result = await service.filesUploadSessionFinish({
                                cursor: cursor,
                                commit: commit,
                                contents: data
                            });
                            me.log("finished uploading in parts: " + to + " size: " + me.core.string.formatBytes(fileSize) + " result: " + result);
                            resolve();
                        }
                        catch (err) {
                            me.log("failed to upload in parts: " + to + " size: " + me.core.string.formatBytes(fileSize) + " err: " + JSON.stringify(err));
                            reject(err);
                        }
                    }
                    else {
                        try {
                            let result = await service.filesUpload({
                                path: to,
                                contents: data
                            });
                            me.log("finished uploading: " + to + " size: " + me.core.string.formatBytes(fileSize) + " result: " + JSON.stringify(result));
                            resolve();
                        }
                        catch (err) {
                            me.log("failed to upload: " + to + " size: " + me.core.string.formatBytes(fileSize) + " err: " + JSON.stringify(err));
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
                        me.log("failed to upload: " + to + " size: " + me.core.string.formatBytes(fileSize) + " err: " + JSON.stringify(err));
                        reject(err);
                        return;
                    }
                    cursor.offset += data.length;
                    me.core.file.resume(fileSession);
                    me.log("uploading " + to + ":" + me.core.string.formatBytes(cursor.offset) + " / " + me.core.string.formatBytes(fileSize));
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
                        me.log("failed to upload: " + to + " size: " + me.core.string.formatBytes(fileSize) + " err: " + JSON.stringify(err));
                        reject(err);
                        return;
                    }
                    cursor.session_id = response.session_id;
                    cursor.offset += data.length;
                    me.core.file.resume(fileSession);
                    me.log("uploading " + to + ":" + me.core.string.formatBytes(cursor.offset) + " / " + me.core.string.formatBytes(fileSize));
                }
            }, chunkSize);
        });
    };
    return "server";
};

screens.storage.dropbox.protocol = function StorageDropBoxProtocol(me) {
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
