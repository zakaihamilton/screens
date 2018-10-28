/*
    @author Zakai Hamilton
    @component CoreObject
*/

screens.core.object = function CoreObject(me) {
    me.protocols = {};
    me.register = function (path, protocol) {
        me.protocols[path] = protocol;
    };
    me.protocol = function (path) {
        if (!path || typeof path !== "string") {
            return null;
        }
        path = path.trim();
        var protocol = null;
        for (var prefix in me.protocols) {
            if (!path.startsWith(prefix)) {
                continue;
            }
            protocol = me.protocols[prefix];
        }
        return protocol;
    };
    me.get = function (path) {
        var protocol = me.protocol(path);
        if (!protocol) {
            return null;
        }
        var object = new Proxy({ path }, protocol);
        return object;
    };
};
