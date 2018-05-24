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
        } else if (me.platform === "browser") {
            me.socket = io();
            me.socket.on("send", async (info) => {
                var args = await me.handleLocal(this, info.args);
                if (args) {
                    info.args = args;
                    me.socket.emit("receive", info);
                }
            });
            me.socket.on("receive", async (info) => {
                var callback = me.core.handle.pop(info.callback);
                callback.apply(null, info.args);
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
            catch (err) {
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
    me.send_browser = async function (path, params) {
        var args = Array.prototype.slice.call(arguments, 0);
        if (me.platform === "browser") {
            return me.send.apply(this, args);
        } else if (me.platform === "server") {
            return me.send_socket.call(this, path, params);
        }
    }
    me.send_client = async function (path, params) {
        var args = Array.prototype.slice.call(arguments, 0);
        if (me.platform === "browser") {
            return screens.worker.postMessage(args);
        } else if (me.platform === "client") {
            return me.send.apply(this, args);
        }
    };
    me.send_socket = function(path, params) {
        return new Promise(async (resolve, reject) => {
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
            me.core.object(me, info);
            if (!info.headers) {
                info.headers = {}
            }
            await me.core.property.set(info, "headers", headers);
            this.emit("send", info);
        });
    };
    me.send_service = function (path, params) {
        if (me.platform === "server") {
            return me.send_socket.call(this, path, params);
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
    me.fillArgs = function(info, args) {
        args = args.map((arg) => {
            var varNames = ["userId", "userName"];
            for (var varName of varNames) {
                if (arg && typeof arg === "string" && arg.includes("$" + varName)) {
                    me.log("replacing: $" + varName + " with: " + info[varName] + " arg: " + arg);
                    arg = arg.replace("$" + varName, info[varName]);
                }
            }
            return arg;
        });
        return args;
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
                    args = me.fillArgs(info, args);
                    var result = await me.core.message.send.apply(info, args);
                    me.log("method: " + path + " result type: " + typeof result);
                    info.body = me.core.type.wrap_args([null, result]);
                }
                catch (e) {
                    me.error("method: " + path + " err: " + (e.message || JSON.stringify(e)), e.stack);
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
    me.headers = function (info) {

    };
};
