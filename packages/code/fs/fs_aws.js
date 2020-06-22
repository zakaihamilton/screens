screens.fs.aws = function FSAWS(me, { storage }) {
    me.init = function () {
        storage.fs.register("aws", me.driver);
    };
};

screens.fs.aws.driver = function FSAWSDriver(me, { storage }) {
    me.mkdir = function () {
        /* ignore on aws */
    };
    me.rmdir = async function (path) {
        await storage.aws.deleteFile(path);
    };
    me.readdir = async function (path) {
        const children = await storage.aws.list(path);
        const items = children.map(child => {
            return child.name;
        });
        return items;
    };
    me.listdir = async function (path) {
        const children = await storage.aws.list(path);
        const items = children.map(child => {
            const { type } = child;
            const isFolder = type === "application/x-directory" || type === "bucket";
            const isReadOnly = type === "bucket";
            return {
                name: child.name,
                stat: {
                    isDirectory: isFolder,
                    isFile: !isFolder,
                    isSymbolicLink: false,
                    size: child.size,
                    date: child.date,
                    isReadOnly
                }
            };
        });
        return items;
    };
    me.readFile = async function (path) {
        const result = await storage.aws.downloadData(path);
        return result;
    };
    me.writeFile = async function (path, data) {
        await storage.aws.uploadData(path, data);
    };
    me.copyFile = async function (from, to) {
        await storage.aws.copyFile(from, to);
    };
    me.unlink = async function (path) {
        await storage.aws.deleteFile(path);
    };
    me.rename = async function (from, to) {
        await storage.aws.moveFile(from, to);
    };
    me.stat = async function (path) {
        if (!path || path === "/") {
            return {
                name: "",
                isDirectory: true,
                isFile: false,
                isSymbolicLink: false
            };
        }
        const metadata = await storage.aws.metadata(path);
        if (!metadata) {
            return null;
        }
        const { type, date } = metadata;
        const isFolder = type === "application/x-directory" || type === "bucket";
        const isReadOnly = type === "bucket";
        metadata.isDirectory = isFolder;
        metadata.isFile = !isFolder;
        metadata.isSymbolicLink = false;
        metadata.isReadOnly = isReadOnly;
        metadata.date = date;
        return metadata;
    };
    me.lstat = async function (path) {
        return me.stat(path);
    };
    me.symlink = async function () {
        throw "Links not supported";
    };
    me.readlink = async function () {
        throw "Links not supported";
    };
    me.du = async function (path) {
        const result = await storage.aws.metadata(path);
        return result && result.size;
    };
    return "browser";
};