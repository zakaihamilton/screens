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
        const UPLOAD_FILE_SIZE_LIMIT = 150 * 1024 * 1024;
        var service = await me.getService();
        var fileSize = await me.core.file.size(from);
        var fileSession = me.core.file.open(from);
        var cursor = { session_id: null, offset: 0 };
        return new Promise((resolve, reject) => {
            const chunkSize = 8 * 1000 * 1000;            
            me.core.file.read(fileSession, data => {
                if (data) {
                    if (cursor.offset) {
                        me.core.file.pause(fileSession);
                        service.filesUploadSessionAppendV2({
                            cursor: cursor,
                            close: false,
                            contents: data
                        }).then(() => {
                            me.core.file.resume(fileSession);
                        });
                    }
                    else {
                        me.core.file.pause(fileSession);
                        service.filesUploadSessionStart({
                            close: false,
                            contents: data
                        }).then(response => {
                            cursor.session_id = response.session_id;
                            me.core.file.resume(fileSession);
                        });
                    }
                    cursor.offset += data.length;
                    me.log("uploading: " + cursor.offset + " / " + fileSize);
                }
                else {
                    var commit = { path: '/' + to, mode: 'overwrite', mute: false };
                    service.filesUploadSessionFinish({
                        cursor: cursor,
                        commit: commit,
                        contents: null
                    });
                    me.log("finished uploading: " + to + " size: " + fileSize);
                    resolve();
                }
            }, chunkSize);
        });
    };
    return "server";
};
