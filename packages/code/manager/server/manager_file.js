/*
 @author Zakai Hamilton
 @component ManagerFile
 */

screens.manager.file = function ManagerFile(me) {
    me.init = function () {
        me.core.mutex.enable(me.id, true);
    };
    me.download = async function (from, to) {
        var exists = me.core.file.exists(to);
        if (exists) {
            return to;
        }
        else {
            me.log("waiting to download file: " + from + " to: " + to);
            var unlock = await me.core.mutex.lock(me.id);
            me.log("downloading file: " + from + " to: " + to);
            exists = me.core.file.exists(to);
            if (!exists) {
                try {
                    await me.storage.dropbox.downloadFile(from, to);
                }
                catch (err) {
                    me.log("Failed to download file: " + from + " err: " + JSON.stringify(err));
                    throw err;
                }
                finally {
                    unlock();
                }
            }
            else {
                unlock();
            }
            me.log("file downloaded: " + from + " to: " + to);
            return to;
        }
    };
    me.upload = async function (from, to) {
        me.log("waiting to upload file: " + from + " to: " + to);
        var unlock = await me.core.mutex.lock(me.id);
        me.log("uploading file: " + from + " to: " + to);
        try {
            await me.storage.dropbox.uploadFile(from, to);
        }
        catch (err) {
            me.log("Failed to upload file: " + from + " err: " + JSON.stringify(err));
            throw err;
        }
        finally {
            unlock();
        }
        me.log("file uploaded: " + from + " to: " + to);
        return to;
    };
    me.clean = async function (path, extensions) {
        var deleted = 0, failed = 0, skipped = 0;
        var items = null;
        try {
            items = await me.core.file.readDir(path);
        }
        catch (err) {
            me.log("Cannot read dir, err: " + err.message || err);
            throw err;
        }
        if (items) {
            for (let item of items) {
                if (extensions) {
                    var extension = me.core.path.extension(item);
                    if (!extension || !extensions.includes(extension)) {
                        skipped++;
                        continue;
                    }
                }
                try {
                    await me.core.file.delete(path + "/" + item);
                    deleted++;
                }
                catch (err) {
                    me.log("cannot delete file: " + item);
                    failed++;
                }
            }
        }
        me.queue = [];
        return { deleted, failed, skipped };
    };
    return "server";
};