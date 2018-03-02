/*
 @author Zakai Hamilton
 @component CoreRequire
 */

package.core.require = function CoreRequire(me) {
    me.require = function(callback, list) {
        if(!list) {
            if(callback) {
                callback();
            }
            return;
        }
        require(list, function () {
            var modules = [];
            list.map((path) => {
                var module = null;
                try {
                    module = require(path);
                }
                catch(e) {
                    me.core.console.error(e);
                }
                modules.push(module);
            });
            if(callback) {
                callback.apply(null, modules);
            }
        });
    };
};
