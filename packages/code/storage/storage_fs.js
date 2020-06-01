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
    me.exists = async function (path) {
        let result = undefined;
        try {
            const stat = await me.stat(path);
            result = true;
        }
        catch (err) {
            result = false;
        }
        return result;
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
        const stat = await me.stat(path);
        if (stat.isDirectory()) {
            const names = await me.readdir(path);
            for (const name of names) {
                const itemPath = path ? (path + "/" + name) : name;
                const item = { name, path: itemPath };
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
        }
        return items;
    };
    me.copy = async function (source, target) {
        const stat = await me.stat(source);
        if (stat.isDirectory()) {
            if (!me.exists(target)) {
                me.mkdir(target);
            }
            const names = me.readdir(source);
            for (const name of names) {
                const path = source + "/" + name;
                me.copy(path, target + "/" + name);
            }
        }
        else {
            if (me.platform === "server") {
                await me.fs.promises.copyFile(source, target);
            }
            else {
                const data = me.readFile(source);
                me.writeFile(target, data);
            }
        }
    };
    me.move = async function (source, target) {
        await me.copy(source, target);
        await me.delete(source);
    };
};

