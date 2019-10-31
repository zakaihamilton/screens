/*
 @author Zakai Hamilton
 @component CoreInterface
 */

screens.core.interface = function CoreInterface(me, { core, storage }) {
    me.init = function () {
        core.property.link("core.http.receive", "core.interface.receive", true);
        core.mutex.enable(me.id, true);
    };
    me.receive = async function (info) {
        var unlock = await core.mutex.lock(me.id);
        unlock();
        if (me.platform === "server" && info.method === "POST" && info.url.startsWith("/interface")) {
            info.args = me.fromTypeFormat(info.body);
            var args = [];
            try {
                await core.property.set(info, "user.verify.verify");
                await core.property.set(info, "user.access.access");
            }
            catch (err) {
                me.log("failed check args: " + JSON.stringify(info.args) + " error: " + err.toString() + " stack: " + err.stack);
                args = [err];
            }
            await core.util.performance(info.args[0], async () => {
                try {
                    core.message.prepareArgs(info);
                    args = await core.message.handleLocal(info, info.args);
                    core.message.releaseArgs(info);
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
        var string = JSON.stringify(core.json.map(args, null, item => {
            return core.type.wrap(item);
        }));
        return string;
    };
    me.fromTypeFormat = function (body) {
        var json = JSON.parse(body);
        var args = core.json.map(json, item => {
            return core.type.unwrap(item);
        });
        return args;
    };
    me.send = async function (method, ...params) {
        var body = me.toTypeFormat([method, ...params]);
        var result = null;
        if (!core.util.isOnline()) {
            result = await storage.local.db.get(me.id, body);
            return result;
        }
        var info = {
            method: "POST",
            url: "/interface/" + method.replace(/\./g, "/"),
            body
        };
        result = await core.http.send(info);
        if (result[0] === "[" || result[0] === "{") {
            result = me.fromTypeFormat(result);
        }
        else {
            result = [result];
        }
        if (result[0]) {
            throw result[0];
        }
        await storage.local.db.set(me.id, body, result[1]);
        return result[1];
    };
};