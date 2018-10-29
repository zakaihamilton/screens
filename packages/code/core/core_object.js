/*
    @author Zakai Hamilton
    @component CoreObject
*/

screens.core.object = function CoreObject(me) {
    me.protocols = {};
    me.register = function (path, protocol) {
        for(let key in protocol) {
            let value = protocol[key];
            if(typeof value === "string") {
                protocol[key] = screens.browse(value);
            }
        }
        me.protocols[path] = protocol;
    };
    me.protocol = function (path) {
        if (!path || typeof path !== "string") {
            return null;
        }
        path = path.trim().split("/").shift();
        if(!path) {
            return null;
        }
        var protocol = null;
        for (var prefix in me.protocols) {
            if (!path.startsWith(prefix)) {
                continue;
            }
            protocol = me.protocols[prefix];
        }
        if(!protocol) {
            for(var name of screens.components) {
                if(!name.includes(path)) {
                    continue;
                }
                var component = screens.browse(name);
                if("protocol" in component) {
                    me.log("found matching protocol in " + name);
                    protocol = component.protocol;
                }
            }
        }
        return protocol;
    };
    me.get = async function (path) {
        var protocol = me.protocol(path);
        if (!protocol) {
            return null;
        }
        var object = await protocol.get(path);
        return object;
    };
};
