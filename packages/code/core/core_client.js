/*
 @author Zakai Hamilton
 @component CoreClient
 */

screens.core.client = function CoreClient(me, { core, user }) {
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
            try {
                var access = await user.access.isAPIAllowed(method, userId);
                if (access) {
                    results[id] = await core.message.send.apply(this, args);
                }
            }
            catch (err) {
                me.log_error("id: " + id + " error: " + err);
                throw err;
            }
        }
        return results;
    };
};
