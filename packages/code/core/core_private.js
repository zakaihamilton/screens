/*
    @author Zakai Hamilton
    @component CorePrivate
*/

package.core.private = function CorePrivate(me) {
    me.keys = function(callback, serviceName) {
        me.core.json.loadFile(callback, "/private/" + serviceName + ".json");
    };
    me.path = function(serviceName) {
        return "private/" + serviceName + ".json";
    };
    return "server";
};
