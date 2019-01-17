/*
 @author Zakai Hamilton
 @component CoreRequire
 */

screens.core.require = function CoreRequire(me) {
    me.load = function (path) {
        if (!path) {
            return;
        }
        if (me.platform === "client") {
            importScripts("/external/require.js");
        }
        var paths = [path];
        if (Array.isArray(path)) {
            paths = path;
        }
        return new Promise((resolve, reject) => {
            require(paths, function (module) {
                if (module) {
                    resolve(module);
                    return;
                }
                try {
                    module = require(path);
                    resolve(module);
                }
                catch (err) {
                    me.log_error(err);
                    reject(err);
                }
            });
        });
    };
};
