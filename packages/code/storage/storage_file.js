/*
 @author Zakai Hamilton
 @component StorageFile
 */

screens.storage.file = function StorageFile(me) {
    me.init = function () {
        me.dropbox = require("dropbox");
        me.fs = require("fs");
        me.https = require('https');
    };
    me.getService = async function () {
        if (me.service) {
            return me.service;
        }
        var keys = await me.core.private.keys("dropbox");
        me.service = new me.dropbox({ accessToken: keys['access-token'] });
        return me.service;
    };
    me.fixPath = function (path) {
        if (path === "/") {
            return "";
        }
        return path;
    };
    me.getChildren = async function (path, recursive) {
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
        var response = await service.filesDownload({ path: path });
        return response;
    };
    me.uploadData = async function (path, data) {
        var service = await me.getService();
        path = me.fixPath(path);
        var response = await service.filesUpload({ path: path, contents: data });
        return reponse;
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
    me.uploadFile = async function (from, to) {
        var data = await me.fs.readFile(from, "binary");
        await me.uploadData(to, data);
    };
    me.uploadFile = async function (from, to) {
        const UPLOAD_FILE_SIZE_LIMIT = 150 * 1024 * 1024;
        var service = await me.getService();
        var fileSize = await me.core.file.size(from);
        var fileData = await me.core.file.readFile(from, "binary");
        var result = false;
        if (fileSize < UPLOAD_FILE_SIZE_LIMIT) { // File is smaller than 150 Mb - use filesUpload API
            result = await dbx.filesUpload({ path: to, contents: fileData, mode: 'overwrite' });
        } else { // File is bigger than 150 Mb - use filesUploadSession* API
            const maxBlob = 8 * 1000 * 1000; // 8Mb - Dropbox JavaScript API suggested max file / chunk size
            var workItems = [];

            var offset = 0;
            while (offset < fileSize) {
                var chunkSize = Math.min(maxBlob, fileSize - offset);
                workItems.push(file.slice(offset, offset + chunkSize));
                offset += chunkSize;
            }

            const task = workItems.reduce((acc, blob, idx, items) => {
                if (idx == 0) {
                    // Starting multipart upload of file
                    return acc.then(function () {
                        return dbx.filesUploadSessionStart({ close: false, contents: blob })
                            .then(response => response.session_id)
                    });
                } else if (idx < items.length - 1) {
                    // Append part to the upload session
                    return acc.then(function (sessionId) {
                        var cursor = { session_id: sessionId, offset: idx * maxBlob };
                        return dbx.filesUploadSessionAppendV2({ cursor: cursor, close: false, contents: blob }).then(() => sessionId);
                    });
                } else {
                    // Last chunk of data, close session
                    return acc.then(function (sessionId) {
                        var cursor = { session_id: sessionId, offset: file.size - blob.size };
                        var commit = { path: '/' + file.name, mode: 'overwrite', mute: false };
                        return dbx.filesUploadSessionFinish({ cursor: cursor, commit: commit, contents: blob });
                    });
                }
            }, Promise.resolve());

            result = await task;
        }
    };
    return "server";
};
