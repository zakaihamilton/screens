/*
    @author Zakai Hamilton
    @component CorePrivate
*/

package.require("core.private", "server");

package.core.private = function CorePrivate(me) {
    me.keys = function(callback, serviceName) {
        me.package.core.json.loadFile(callback, "/private/" + serviceName + ".json");
    };
};
