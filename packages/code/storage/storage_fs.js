/*
 @author Zakai Hamilton
 @component StorageFS
 */

screens.storage.fs = function StorageFS(me, { core, storage }) {
    me.init = async function () {
        if (me.platform === "server") {
            me.driver = storage.fs.server;
        }
        else {
            me.driver = storage.fs.local;
        }
        const keys = ["read", "write", "list", "delete", "type", "timestamp"];
        const methods = {};
        keys.forEach(key => {
            me[key] = (path, ...args) => {
                path = me.fixPath(path);
                return me.driver[key](path, ...args);
            }
            methods[key] = "storage.fs." + key;
        });
        core.broadcast.register(me, methods);
    };
    me.fixPath = function (path) {
        if (!path) {
            throw "Invalid path";
        }
        if (path[path.length - 1 === '/']) {
            path = path.substring(0, -1);
        }
        return path;
    }
};

screens.storage.fs.server = function StorageFSServer(me, { core }) {
    me.read = async function (path) {
        const type = await me.type(path);
        if (type === "file") {
            return await core.file.readFile(path);
        }
    };
    me.write = async function (path, data) {
        const type = await me.type(path);
        if (type === "file") {
            await core.file.writeFile(path, data);
        }
        else {
            throw "Cannot write since object is a folder, path:" + path;
        }
    };
    me.list = async function (path) {
        let items = [];
        const type = await me.type(path);
        if (type === "folder") {
            items = await core.file.readDir(path);
        }
        return items;
    };
    me.delete = async function (path) {
        if (core.file.exists(path)) {
            await core.file.delete(path);
        }
    };
    me.type = async function (path) {
        if (core.file.exists(path)) {
            const isFolder = await core.file.isDirectory(path);
            return isFolder ? "folder" : "file";
        }
        return "";
    };
    me.timestamp = async function (path) {
        if (core.file.exists(path)) {
            return await core.file.timestamp(path);
        }
    }
};

screens.storage.fs.local = function StorageFSLocal(me, { core, storage }) {
    me.info = async function (path) {
        return storage.local.db.get(me.id, "info:" + path);
    };
    me.setInfo = async function (path, info) {
        await storage.local.db.set(me.id, "info:" + path, info);
    };
    me.read = async function (path) {
        const type = await me.type(path);
        if (type === "file") {
            return await storage.local.db.get(me.id, "data:" + path);
        }
    };
    me.write = async function (path, data) {
        const type = await me.type(path);
        if (type === "folder") {
            throw "Cannot write since object is a folder, path:" + path;
        }
        let info = await me.info(path);
        if (!info) {
            let folderPath = core.path.folderPath(path);
            let folderInfo = await me.info(folderPath);
            if (!folderInfo) {
                folderInfo = {
                    type: "folder",
                    items: [],
                    timestamp: Date.now()
                };
            }
            const name = path.split("/").pop();
            folderInfo.items.push(name);
            await me.setInfo(folderPath, folderInfo);
            info = {
                type: "file"
            };
        }
        info.size = data ? data.length : 0;
        info.timestamp = Date.now();
        await me.setInfo(path, info);
        await storage.local.db.set(me.id, "data:" + path, data);
    };
    me.list = async function (path) {
        const type = await me.type(path);
        if (type === "folder") {
            const info = await me.info(path);
            const { items } = info;
            return items;
        }
        return [];
    };
    me.delete = async function (path) {
        const type = await me.type(path);
        if (!type) {
            return;
        }
        if (type === "folder") {
            const items = me.list(path);
            for (const name of items) {
                await me.delete(path + "/" + name);
            }
        }
        const name = path.split("/").pop();
        const folderPath = core.path.folderPath(path);
        const folderInfo = await me.info(folderPath);
        if (folderInfo) {
            folderInfo.items = folderInfo.items.filter(item => item !== name);
            folderPath.timestamp = Date.now();
            await me.setInfo(folderPath, folderInfo);
        }
        await storage.local.db.set(me.id, "info:" + path);
        if (type === "file") {
            await storage.local.db.set(me.id, "data:" + path);
        }
    };
    me.type = async function (path) {
        let type = "";
        const info = await me.info(path);
        if (info) {
            type = info.type;
        }
        return type;
    };
    me.type = async function (path) {
        let timestamp = null;
        const info = await me.info(path);
        if (info) {
            timestamp = info.timestamp;
        }
        return timestamp;
    };
}