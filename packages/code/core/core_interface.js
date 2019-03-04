/*
 @author Zakai Hamilton
 @component CoreInterface
 */

screens.core.interface = function CoreInterface(me) {
    me.init = function () {
        me.core.property.link("core.http.receive", "core.interface.receive", true);
        me.core.mutex.enable(me.id, true);
    };
    me.receive = async function (info) {
        var unlock = await me.core.mutex.lock(me.id);
        unlock();
        if (me.platform === "server" && info.method === "POST" && info.url.startsWith("/interface")) {
            info.args = me.fromTypeFormat(info.body);
            var args = [];
            try {
                await me.core.property.set(info, "user.verify.verify");
                await me.core.property.set(info, "user.access.access");
            }
            catch (err) {
                me.log("failed check args: " + JSON.stringify(info.args) + " error: " + err.toString() + " stack: " + err.stack);
                args = [err];
            }
            await me.core.util.performance(info.args[0], async () => {
                try {
                    me.core.message.prepareArgs(info);
                    args = await me.core.message.handleLocal(info, info.args);
                    me.core.message.releaseArgs(info);
                }
                catch (err) {
                    me.log("args: " + JSON.stringify(info.args) + " error: " + err.toString() + " stack: " + err.stack);
                    args = [err];
                }
            });

            info["content-type"] = "application/json";
            info.body = me.toTypeFormat(args);
        }
    };
    me.toTypeFormat = function (args) {
        var string = JSON.stringify(me.core.json.map(args, null, item => {
            return me.core.type.wrap(item);
        }));
        return string;
    };
    me.fromTypeFormat = function (body) {
        var json = JSON.parse(body);
        var args = me.core.json.map(json, item => {
            return me.core.type.unwrap(item);
        });
        return args;
    };
    me.send = async function (method) {
        var args = Array.prototype.slice.call(arguments, 0);
        var body = me.toTypeFormat(args);
        var result = null;
        if (!me.core.util.isOnline()) {
            result = await me.storage.local.db.get(me.id, body);
            return result;
        }
        var info = {
            method: "POST",
            url: "/interface/" + method.replace(/\./g, "/"),
            body
        };
        result = me.fromTypeFormat(await me.core.http.send(info));
        if (result[0]) {
            throw result[0];
        }
        await me.storage.local.db.set(me.id, body, result[1]);
        return result[1];
    };
};