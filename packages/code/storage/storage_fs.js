/*
 @author Zakai Hamilton
 @component StorageFS
 */

screens.storage.fs = function StorageFS(me, { core }) {
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
    me.isDirectory = async function (path) {
        let isDirectory = false;
        const stat = await me.stat(path);
        if (stat.isDirectory()) {
            isDirectory = true;
        }
        return isDirectory;
    };
    me.list = async function (path) {
        const items = [];
        const stat = await me.stat(path);
        if (stat.isDirectory()) {
            const names = await me.readdir(path);
            for (const name of names) {
                const itemPath = path ? (path + "/" + name) : name;
                const item = { name, path: itemPath };
                try {
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
                catch (err) {
                    console.log("Cannot read file: " + item.path);
                }
            }
        }
        return items;
    };
    me.copy = async function (from, to) {
        const stat = await me.stat(from);
        if (stat.isDirectory()) {
            if (!await me.exists(to)) {
                await me.mkdir(to);
            }
            const names = await me.readdir(from);
            for (const name of names) {
                const path = from + "/" + name;
                await me.copy(path, to + "/" + name);
            }
        }
        else {
            if (me.platform === "server") {
                await me.fs.promises.copyFile(from, to);
            }
            else {
                const data = await me.readFile(from);
                await me.writeFile(to, data);
            }
        }
    };
    if (me.platform === "browser") {
        me.transfer = async function (from, to, source, target) {
            if (source === target) {
                return await me.sendTo(target, "copy", from, to);
            }
            const isDirectory = await me.sendTo(source, "isDirectory", from);
            if (isDirectory) {
                if (!await me.sendTo(target, "exists", to)) {
                    await me.sendTo(target, "mkdir", to);
                }
                const names = await me.sendTo(source, "readdir", from);
                for (const name of names) {
                    const path = from + "/" + name;
                    await me.transfer(path, to + "/" + name, source, target);
                }
            }
            else {
                const data = await me.sendTo(source, "readFile", from, "utf8");
                await me.sendTo(target, "writeFile", to, data);
            }
        };
        me.sendTo = async function (source, method, ...params) {
            var send = core.message["send_" + source];
            return await send("storage.fs." + method, ...params);
        };
    }
};

