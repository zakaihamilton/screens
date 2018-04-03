/*
 @author Zakai Hamilton
 @component CoreRequire
 */

screens.core.require = function CoreRequire(me) {
    me.apply = function(path) {
        if(!path) {
            return;
        }
        return new Promise((resolve, reject) => {
            require(list, function () {
                var module = null;
                try {
                    module = require(path);
                    resolve(module);
                }
                catch(err) {
                    me.error(err);
                    reject(err);
                }
            });
        });
    };
};
