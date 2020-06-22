/*
 @author Zakai Hamilton
 @component StorageFS
 */

screens.storage.fs = function StorageFS(me, { core }) {
    me.methodNames = [
        "mkdir",
        "rmdir",
        "readdir",
        "listdir",
        "writeFile",
        "copyFile",
        "readFile",
        "unlink",
        "rename",
        "stat",
        "lstat",
        "symlink",
        "readlink",
        "du"
    ];
    me.sources = {};
    me.init = function () {
        me.methodNames.map(methodName => {
            if (methodName === "copyFile" || methodName === "rename") {
                me[methodName] = (from, to, ...args) => {
                    const [source, ...fromPath] = from.split("/");
                    const [, ...toPath] = to.split("/");
                    const driver = me.sources[source];
                    const method = driver[methodName];
                    return method("/" + fromPath.join("/"), "/" + toPath.join("/"), ...args);
                };
            }
            else {
                me[methodName] = (url, ...args) => {
                    const [source, ...path] = url.split("/");
                    const driver = me.sources[source];
                    const method = driver[methodName];
                    if (!method) {
                        return null;
                    }
                    return method("/" + path.join("/"), ...args);
                };
            }
        });
    };
    me.register = function (source, handler) {
        me.sources[source] = handler;
    };
    me.useFile = function (path, encoding) {
        const [data, setData] = React.useState(null);
        React.useEffect(() => {
            const load = async () => {
                const result = await me.readFile(path, encoding);
                if (result) {
                    setData(result);
                }
            };
            load();
        }, []);
        return data;
    };
    me.exists = async function (path) {
        let result = undefined;
        try {
            const stat = await me.stat(path);
            if (stat) {
                result = true;
            }
        }
        catch (err) {
            result = false;
        }
        return result;
    };
    me.delete = async function (path) {
        const stat = await me.stat(path);
        if (stat) {
            if (stat.isDirectory) {
                const names = await me.readdir(path);
                for (const name of names) {
                    await me.delete(core.path.normalize(path, name));
                }
                await me.rmdir(path);
            }
            if (stat.isFile) {
                await me.unlink(path);
            }
        }
    };
    me.isDirectory = async function (path) {
        let isDirectory = false;
        const stat = await me.stat(path);
        if (stat && stat.isDirectory) {
            isDirectory = true;
        }
        return isDirectory;
    };
    me.list = async function (path) {
        const items = [];
        const stat = await me.stat(path);
        if (stat && stat.isDirectory) {
            const results = await me.listdir(path);
            if (results) {
                return results.map(result => {
                    const { stat, name } = result;
                    const itemPath = core.path.normalize(path, name);
                    let type = "";
                    if (stat.isDirectory) {
                        type = "folder";
                    }
                    else if (stat.isFile) {
                        type = "file";
                    }
                    else if (stat.isSymbolicLink) {
                        type = "link";
                    }
                    return {
                        name,
                        path: itemPath,
                        size: stat.size,
                        date: stat.date,
                        type,
                        isReadOnly: stat.isReadOnly
                    };
                });
            }
            const names = await me.readdir(path);
            for (const name of names) {
                const itemPath = core.path.normalize(path, name);
                const item = { name, path: itemPath };
                try {
                    const stat = await me.stat(item.path);
                    if (!stat) {
                        continue;
                    }
                    if (stat.isDirectory) {
                        item.type = "folder";
                        if (me.du) {
                            item.size = await me.du(item.path);
                        }
                    }
                    else if (stat.isFile) {
                        item.type = "file";
                        item.size = stat.size;
                    }
                    else if (stat.isSymbolicLink) {
                        item.type = "link";
                    }
                    item.date = stat.date;
                    item.isReadOnly = stat.isReadOnly;
                    items.push(item);
                }
                catch (err) {
                    // eslint-disable-next-line no-console
                    console.log("Cannot read file: " + item.path + " err: " + err);
                }
            }
        }
        return items;
    };
    me.copy = async function (from, to) {
        const stat = await me.stat(from);
        if (stat) {
            if (stat.isDirectory) {
                if (!await me.exists(to)) {
                    await me.mkdir(to);
                }
                const names = await me.readdir(from);
                for (const name of names) {
                    const path = core.path.normalize(from, name);
                    await me.copy(path, core.path.normalize(to, name));
                }
            }
            else {
                await me.copyFile(from, to);
            }
        }
    };
    me.createPath = async function (base, path) {
        if (path.indexOf(base) === 0) {
            path = path.slice(base.length);
        }
        var tokens = path.split("/").filter(Boolean);
        var mkdirPath = base;
        if (await me.exists(path)) {
            return;
        }
        for (var token of tokens) {
            if (mkdirPath) {
                mkdirPath += "/" + token;
            }
            else {
                mkdirPath = token;
            }
            if (!await me.exists(mkdirPath)) {
                await me.mkdir(mkdirPath);
            }
        }
    };
    me.transfer = async function (from, to) {
        const [fromSource] = from.split("/");
        const [toSource] = to.split("/");
        if (fromSource === toSource) {
            return await me.copy(from, to);
        }
        const isDirectory = await me.isDirectory(from);
        if (isDirectory) {
            if (!await me.exists(to)) {
                await me.mkdir(to);
            }
            const names = await me.readdir(from);
            for (const name of names) {
                const path = core.path.normalize(from, name);
                await me.transfer(path, core.path.normalize(to, name));
            }
        }
        else {
            const data = await me.readFile(from);
            const array = [...data];
            await me.writeFile(to, array);
        }
    };
};
