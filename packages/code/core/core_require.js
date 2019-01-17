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
        return new Promise((resolve, reject) => {
            require(path, function (module) {
                if (module) {
                    resolve(module);
                    return;
                }
                try {
                    var firstModulePath = path;
                    if (Array.isArray(path)) {
                        firstModulePath = path[0];
                    }
                    module = require(firstModulePath);
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
