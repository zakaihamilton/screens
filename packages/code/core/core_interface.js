/*
 @author Zakai Hamilton
 @component CoreInterface
 */

screens.core.interface = function CoreInterface(me) {
    me.init = function () {
        me.core.property.link("core.http.receive", "core.interface.receive", true);
    };
    me.receive = async function (info) {
        if (me.platform === "server" && info.method === "POST" && info.url.startsWith("/interface")) {
            info.args = JSON.parse(info.body);
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
            info.body = JSON.stringify(args);
        }
    };
    me.send = async function (method) {
        var args = Array.prototype.slice.call(arguments, 0);
        var info = {
            method: "POST",
            url: "/interface",
            body: JSON.stringify(args)
        };
        var result = JSON.parse(await me.core.http.send(info));
        if (result[0]) {
            throw result[0];
        }
        return result[1];
    };
};