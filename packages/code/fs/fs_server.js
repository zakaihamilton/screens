screens.fs.server = function FServer(me, { storage }) {
    me.init = function () {
        storage.fs.register("server", me.driver);
    };
};

screens.fs.server.driver = function FServerDriver(me, { storage }) {
    me.init = function () {
        me.fs = require("fs");
        storage.fs.methodNames.map(methodName => {
            if (me.fs && me.fs.promises && me.fs.promises[methodName]) {
                me[methodName] = async (...args) => {
                    args[0] = process.cwd() + "/" + args[0].replace(/\.\.?\//, "");
                    let method = me.fs.promises[methodName];
                    if (typeof method !== "function") {
                        throw methodName + " is not a function";
                    }
                    if (methodName === "writeFile" && typeof args[1] !== "string" && Array.isArray(args[1])) {
                        args[1] = Buffer.from(args[1]);
                    }
                    const result = await method(...args);
                    if (methodName === "stat" || methodName === "lstat") {
                        result.isDirectory = result.isDirectory();
                        result.isFile = result.isFile();
                        result.isSymbolicLink = result.isSymbolicLink();
                        result.date = result.mtimeMs;
                    }
                    return result;
                };
            }
        });
    };
    return "server";
};
