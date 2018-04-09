/*
 @author Zakai Hamilton
 @component me.coreMessage
 */

screens.core.message = function CoreMessage(me) {
    me.init = async function () {
        if (screens.platform === "server") {
            me.core.property.link("core.http.receive", "core.message.receiveHttp", true);
        } else if (me.platform === "client") {
            var registerPromiseWorker = await me.core.require('/node_modules/promise-worker/dist/promise-worker.register.js');
            registerPromiseWorker(async (message) => {
                return await me.send.apply(null, message);
            });
        }
    };
    me.loadWorker = async function (path) {
        var PromiseWorker = await me.core.require('/node_modules/promise-worker/dist/promise-worker.js');
        screens.worker = new PromiseWorker(new Worker(path));
        screens.worker.postMessage(null);
    };
    me.send_server = async function (path, params) {
        if (me.platform === "service") {
            return new Promise((resolve, reject) => {
                var responseCallback = (err, result) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(result);
                    }
                };
                var args = Array.prototype.slice.call(arguments, 1);
                var info = {
                    path: path,
                    params: me.core.type.wrap_args(args),
                    callback: me.core.handle.push(responseCallback)
                };
                me.core.service.client.emit("send", info);
            });
        }
        else if (me.platform !== "server") {
            var args = Array.prototype.slice.call(arguments, 1);
            var info = {
                method: "POST",
                url: "/method/" + path,
                body: me.core.type.wrap_args(args)
            };
            var response = await me.core.http.send(info);
            try {
                response = me.core.type.unwrap_args(response);
            }
            catch(err) {
                throw "invalid response for method: " + path + " err: " + err.message || err;
            }
            if (response && response[0]) {
                throw response[0];
            }
            return response[1];
        } else if (me.platform === "server") {
            var args = Array.prototype.slice.call(arguments, 0);
            return me.send.apply(null, args);
        }
    };
    me.send_client = async function (path, params) {
        var args = Array.prototype.slice.call(arguments, 0);
        if (me.platform === "browser") {
            return screens.worker.postMessage(args);
        } else if (me.platform === "client") {
            return me.send.apply(this, args);
        }
    };
    me.send_service = function (path, params) {
        if (me.platform === "server") {
            return new Promise((resolve, reject) => {
                var responseCallback = (err, result) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(result);
                    }
                };
                var args = Array.prototype.slice.call(arguments, 0);
                var info = {
                    args: me.core.type.wrap_args(args),
                    callback: me.core.handle.push(responseCallback)
                };
                this.emit("send", info);
            });
        } else if (me.platform === "service") {
            var args = Array.prototype.slice.call(arguments, 0);
            return me.send.apply(this, args);
        }
    };
    me.send_platform = function (platform, path, params) {
        var args = Array.prototype.slice.call(arguments, 1);
        if (!platform) {
            platform = me.platform;
        }
        return me["send_" + platform].apply(null, args);
    };
    me.receiveHttp = {
        set: async function (info) {
            if (me.platform === "server" && info.method === "POST" && info.url.startsWith("/method/")) {
                var find = "/method/";
                var path = info.url.substring(info.url.indexOf(find) + find.length);
                var args = me.core.type.unwrap_args(me.core.http.parse_query(info.body));
                info.body = null;
                args.unshift(path);
                try {
                    args = args.map((arg) => {
                        if (arg && typeof arg === "string" && arg.includes("$user")) {
                            me.log("replacing: $user with: " + info.user + " arg: " + arg);
                            arg = arg.replace(/\$user/, info.user);
                        }
                        return arg;
                    });
                    var result = await me.core.message.send.apply(info, args);
                    me.log("method: " + path + " result type: " + typeof result);
                    info.body = me.core.type.wrap_args([null, result]);
                }
                catch (e) {
                    me.error("method: " + path + " err: " + (e.message || e), e.stack);
                    info.body = me.core.type.wrap_args([e]);
                }
            }
        }
    };
    me.send = function (path, params) {
        var args = Array.prototype.slice.call(arguments, 1);
        var callback = null;
        if (!path) {
            return undefined;
        }
        if (typeof path === "function") {
            var result = path.apply(this, args);
            return result;
        }
        try {
            callback = screens(path);
        } catch (error) {
            //me.log(error);
            return undefined;
        }
        me.log("sending: " + path + " with " + args.length + " arguments, ip: " + this.clientIp);
        if (typeof callback === "function") {
            var result = callback.apply(this, args);
            return result;
        } else {
            me.log("callback is not a function but rather " + JSON.stringify(callback));
        }
    };
    me.handleLocal = async function (_this, args) {
        if (!args) {
            return;
        }
        try {
            var result = await me.send.apply(info, args);
            return [null, result];
        }
        catch (err) {
            return [err];
        }
    };
};
