/*
 @author Zakai Hamilton
 @component CoreClient
 */

screens.core.client = function CoreClient(me, packages) {
    const { core, user } = packages;
    me.send = function (methods) {
        return core.message.send_server("core.client.handle", methods);
    };
    me.handle = async function (methods, userId) {
        var results = {};
        if (!userId) {
            userId = this.userId;
        }
        for (let id in methods) {
            let args = methods[id];
            let method = args[0];
            var access = await user.access.isAPIAllowed(method, userId);
            if (access) {
                results[id] = await me.core.message.send.apply(this, args);
            }
        }
        return results;
    };
};
