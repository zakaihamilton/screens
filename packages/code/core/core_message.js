/*
 @author Zakai Hamilton
 @component me.coreMessage
 */

screens.core.message = function CoreMessage(me) {
    me.init = async function () {
        if(me.platform === "client" || me.platform === "browser") {
            await me.import('/node_modules/promise-worker-bi/dist/index.js');
        }
        if (me.platform === "client") {
            me.worker = new PromiseWorker();
            me.worker.register(async (message) => {
                return await me.send.apply(null, message);
            });
        }
    };
    me.loadWorker = async function (path) {
        me.worker = new PromiseWorker(new Worker(path));
        me.worker.postMessage(null);
        me.worker.register(async (message) => {
            return await me.send.apply(null, message);
        });
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
            var args = Array.prototype.slice.call(arguments, 0);
            return me.send_socket.apply(me.core.socket.io, args);
        } else if (me.platform === "server") {
            var args = Array.prototype.slice.call(arguments, 0);
            return me.send.apply(null, args);
        }
    };
    me.send_browser = async function (path, params) {
        var args = Array.prototype.slice.call(arguments, 0);
        if (me.platform === "client") {
            return me.worker.postMessage(args);
        } else if (me.platform === "browser") {
            return me.send.apply(this, args);
        } else if (me.platform === "server") {
            return me.send_socket.call(this, path, params);
        }
    }
    me.send_client = async function (path, params) {
        var args = Array.prototype.slice.call(arguments, 0);
        if (me.platform === "browser") {
            return me.worker.postMessage(args);
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
                args: args,
                callback: me.core.handle.push(responseCallback)
            };
            me.prepareArgs(info);
            me.core.object(me, info);
            if (!info.headers) {
                info.headers = {}
            }
            await me.core.property.set(info, "headers", null);
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
    me.prepareArgs = function(info) {
        var args = info.args;
        if(args) {
            args = args.map((arg) => {
                if(!arg) {
                    return null;
                }
                if(me.platform === "server") {
                    if(typeof arg === "string") {
                        var varNames = ["userId", "userName"];
                        for (var varName of varNames) {
                            if (arg.includes("$" + varName)) {
                                me.log("replacing: $" + varName + " with: " + info[varName] + " arg: " + arg);
                                arg = arg.replace("$" + varName, info[varName]);
                            }
                        }
                        if(me.core.handle.isHandle(arg, "function")) {
                            var handle = arg;
                            arg = function() {
                                var sendArgs = Array.prototype.slice.call(arguments);
                                var sendInfo = {args:sendArgs,callback:handle};
                                info.socket.emit("notify", sendInfo);
                            };
                        }
                    }
                }
                else if(me.platform === "browser") {
                    if(typeof arg === "function") {
                        arg = me.core.handle.push(arg, typeof arg);
                    }
                }
                return arg;
            });
        }
        info.args = args;
    };
    me.releaseArgs = function(info) {
        var args = info.args;
        if(args) {
            args = args.map((arg) => {
                if(!arg) {
                    return null;
                }
                if(me.platform === "browser") {
                    if(typeof arg === "string") {
                        if(me.core.handle.isHandle(arg, "function")) {
                            arg = me.core.handle.pop(arg, "function");
                        }
                    }
                }
                return arg;
            });
        }
        info.args = args;
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
            var result = await me.send.apply(_this, args);
            return [null, result];
        }
        catch (err) {
            return [err];
        }
    };
    me.headers = function (info) {

    };
};
