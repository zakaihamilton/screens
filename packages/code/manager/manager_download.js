/*
 @author Zakai Hamilton
 @component ManagerDownload
 */

screens.manager.download = function ManagerDownload(me) {
    me.get = async function (from, to) {
        var exists = me.core.file.exists(to);
        if (exists) {
            return to;
        }
        else {
            me.log("waiting to download file: " + from + " to: " + to);
            var unlock = await me.core.mutex.lock();
            me.log("downloading file: " + from + " to: " + to);
            try {
                await me.storage.file.downloadFile(from, to);
            }
            catch (err) {
                me.log("Failed to download file: " + from + " err: " + JSON.stringify(err));
                unlock();
                throw err;
            }
            unlock();
            me.log("file downloaded: " + from + " to: " + to);
            return to;
        }
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
                if(extensions) {
                    var extension = me.core.path.extension(item);
                    if(!extension || !extensions.includes(extension)) {
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
        return {deleted, failed, skipped};
    };
    return "server";
};