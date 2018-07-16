/*
 @author Zakai Hamilton
 @component ManagerDownload
 */

screens.manager.download = function ManagerDownload(me) {
    me.get = async function (from, to) {
        var exists = me.core.file.exists(to);
        if (exists) {
            me.log(to + " already downloaded");
            return to;
        }
        else {
            me.log("downloading file: " + from + " to: " + to);
            var unlock = me.core.mutex.lock();
            await me.storage.file.downloadFile(from, to);
            unlock();
            return to;
        }
    };
    me.clean = async function (path) {
        var items = null;
        me.log("deleting files in: " + path);
        try {
            items = await me.core.file.readDir(path);
        }
        catch (err) {
            me.log("Cannot read dir, err: " + err.message || err);
        }
        if (items) {
            for (let item of items) {
                try {
                    await me.core.file.delete(path + "/" + item);
                    me.log("deleted file: " + item);
                }
                catch (err) {
                    me.log("cannot delete file: " + item);
                }
            }
        }
        me.queue = [];
    }
    return "server";
};