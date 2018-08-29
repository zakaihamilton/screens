/*
 @author Zakai Hamilton
 @component CoreRequire
 */

screens.core.require = function CoreRequire(me) {
    me.proxy.apply = function(path) {
        if(!path) {
            return;
        }
        if(me.platform === "client") {
            importScripts("/external/require.js");
        }
        return new Promise((resolve, reject) => {
            require([path], function (module) {
                if(module) {
                    resolve(module);
                }
                try {
                    module = require(path);
                    resolve(module);
                }
                catch(err) {
                    me.log_error(err);
                    reject(err);
                }
            });
        });
    };
};
