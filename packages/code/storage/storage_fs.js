/*
 @author Zakai Hamilton
 @component StorageFS
 */

screens.storage.fs = function StorageFS(me, { }) {
    me.init = function () {
        if (me.platform === "server") {
            me.fs = require("fs");
        }
        else if (me.platform === "browser") {
            me.fs = new LightningFS("screens-fs");
        }
        const methodNames = [
            "mkdir",
            "rmdir",
            "readdir",
            "writeFile",
            "readFile",
            "unlink",
            "rename",
            "stat",
            "lstat",
            "symlink",
            "readlink",
            "du"
        ];
        methodNames.map(methodName => {
            me[methodName] = async (...args) => {
                return await me.fs.promises[methodName](...args);
            };
        });
    };
    me.delete = async function (path) {
        const stat = await me.stat(path);
        if (stat.isDirectory()) {
            const names = await me.readdir(path);
            for (const name of names) {
                await me.delete(path + "/" + name);
            }
            await me.rmdir(path);
        }
        if (stat.isFile()) {
            await me.unlink(path);
        }
    };
    me.list = async function (path) {
        const items = [];
        const names = await me.readdir(path);
        for (const name of names) {
            const item = { name, path: path + "/" + name };
            const stat = await me.stat(item.path);
            if (stat.isDirectory()) {
                item.type = "folder";
            }
            else if (stat.isFile()) {
                item.type = "file";
            }
            else if (stat.isSymbolicLink()) {
                item.type = "link";
            }
            items.push(item);
        }
        return items;
    };
};

