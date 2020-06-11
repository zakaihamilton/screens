screens.fs.local = function FSLocal(me, { storage }) {
    me.init = function () {
        storage.fs.register("local", me.driver);
    };
};

screens.fs.local.driver = function FServerDriver(me, { storage }) {
    me.init = function () {
        // eslint-disable-next-line no-undef
        me.fs = new LightningFS("screens-fs");
        storage.fs.methodNames.map(methodName => {
            if (me.fs && me.fs.promises[methodName]) {
                me[methodName] = async (...args) => {
                    let method = me.fs.promises[methodName];
                    if (typeof method !== "function") {
                        throw methodName + " is not a function";
                    }
                    if (methodName === "writeFile" && typeof args[1] !== "string" && Array.isArray(args[1])) {
                        args[1] = Uint8Array.from(args[1]);
                    }
                    const result = await method(...args);
                    if (methodName === "stat" || methodName === "lstat") {
                        result.isDirectory = result.isDirectory();
                        result.isFile = result.isFile();
                        result.isSymbolicLink = result.isSymbolicLink();
                    }
                    return result;
                };
            }
            else if (methodName === "copyFile") {
                me[methodName] = async (from, to) => {
                    const data = await me.readFile(from);
                    const array = [...data];
                    await me.writeFile(to, array);
                };
            }
        });
    };
    return "browser";
};