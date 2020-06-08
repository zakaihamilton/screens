screens.fs.dropbox = function FSDropBox(me, { storage }) {
    me.init = function () {
        storage.fs.register("dropbox", me.driver);
    };
};

screens.fs.dropbox.driver = function FSDropBoxDriver(me, { storage }) {
    me.mkdir = async function (path) {
        await storage.dropbox.createFolder(path);
    };
    me.rmdir = async function (path) {
        await storage.dropbox.deleteFile(path);
    };
    me.readdir = async function (path) {
        const children = await storage.dropbox.getChildren(path);
        const items = children.map(child => {
            return child.name;
        });
        return items;
    };
    me.listdir = async function (path) {
        const children = await storage.dropbox.getChildren(path);
        const items = children.map(child => {
            const type = child[".tag"]
            return {
                name: child.name,
                stat: {
                    isDirectory: type === "folder",
                    isFile: type === "file",
                    isSymbolicLink: false,
                    size: child.size
                }
            };
        });
        return items;
    }
    me.readFile = async function (path, options) {
        const result = await storage.dropbox.downloadData(path);
        return result;
    };
    me.writeFile = async function (path, data, options) {
        await storage.dropbox.uploadData(path, data);
    };
    me.copyFile = async function (from, to) {
        await storage.dropbox.copyFile(from, to);
    };
    me.unlink = async function (path) {
        await storage.dropbox.deleteFile(path);
    };
    me.rename = async function (from, to) {
        await storage.dropbox.moveFile(from, to);
    };
    me.stat = async function (path) {
        const metadata = await storage.dropbox.metadata(path);
        const type = metadata[".tag"];
        metadata.isDirectory = type === "folder";
        metadata.isFile = type === "file";
        metadata.isSymbolicLink = false;
        return metadata;
    };
    me.lstat = async function (path) {
        return me.stat(path);
    };
    me.symlink = async function (path) {
        throw "Links not supported";
    };
    me.readlink = async function (path) {
        throw "Links not supported";
    };
    me.du = async function (path) {
        const result = await storage.dropbox.metadata(path);
        return result.size;
    };
    return "browser";
};