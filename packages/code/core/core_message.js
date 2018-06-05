/*
 @author Zakai Hamilton
 @component me.coreMessage
 */

screens.core.message = function CoreMessage(me) {
    me.init = async function () {
        if (me.platform === "client" || me.platform === "browser") {
            await me.import('/node_modules/promise-worker-bi/dist/index.js');
        }
        if (me.platform === "client") {
            me.worker = new PromiseWorker();
            me.register();
        }
    };
    me.register = function() {
        me.worker.register(async (info) => {
            if(!info) {
                return;
            }
            if (info.callback) {
                info.callback = me.core.handle.pop(info.callback, "function");
                if(info.callback) {
                    return await info.callback.apply(null, info.args);
                }
            }
            else {
                return await me.send.apply(null, info.args);
            }
        });
    };
    me.loadWorker = async function (path) {
        me.worker = new PromiseWorker(new Worker(path));
        me.register();
        me.worker.postMessage(null);
    };
    me.send_server = function (path, params) {
        var args = Array.prototype.slice.call(arguments, 0);
        if (me.platform === "server") {
            return me.send.apply(null, args);
        }
        else {
            return me.send_socket.apply(me.core.socket.io, args);
        }
    };
    me.send_browser = function (path, params) {
        var args = Array.prototype.slice.call(arguments, 0);
        if (me.platform === "client") {
            return me.send_info((info) => {
                return me.worker.postMessage(info);
            }, args);
        } else if (me.platform === "browser") {
            return me.send.apply(this, args);
        } else if (me.platform === "server") {
            return me.send_socket.apply(this, args);
        }
    }
    me.send_client = function (path, params) {
        var args = Array.prototype.slice.call(arguments, 0);
        if (me.platform === "browser") {
            return me.send_info((info) => {
                return me.worker.postMessage(info);
            }, args);
        } else if (me.platform === "client") {
            return me.send.apply(this, args);
        }
    };
    me.send_socket = function (path, params) {
        var args = Array.prototype.slice.call(arguments, 0);
        return me.send_info((info) => {
            return me.core.socket.send(this, "send", info);
        }, args);
    };
    me.send_info = async function (send_callback, args) {
        var info = {
            args,
            headers: {},
            platform: me.platform
        };
        me.prepareArgs(info);
        me.core.object(me, info);
        await me.core.property.set(info, "headers", null);
        var result = send_callback(info);
        return result;
    };
    me.send_service = function (path, params) {
        var args = Array.prototype.slice.call(arguments, 0);
        if (me.platform === "server") {
            return me.send_socket.apply(this, args);
        } else if (me.platform === "service") {
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
    me.prepareArgs = function (info) {
        var args = info.args;
        if (args) {
            args = args.map((arg) => {
                if (!arg) {
                    return null;
                }
                if (me.platform === "server") {
                    if (typeof arg === "string") {
                        var varNames = ["userId", "userName"];
                        for (var varName of varNames) {
                            if (arg.includes("$" + varName)) {
                                me.log("replacing: $" + varName + " with: " + info[varName] + " arg: " + arg);
                                arg = arg.replace("$" + varName, info[varName]);
                            }
                        }
                        if (me.core.handle.isHandle(arg, "function")) {
                            var handle = arg;
                            arg = function () {
                                var sendArgs = Array.prototype.slice.call(arguments, 0);
                                var sendInfo = { args: sendArgs, callback: handle };
                                info.socket.emit("notify", sendInfo);
                            };
                        }
                    }
                }
                else if (me.platform === "client") {
                    if (me.core.handle.isHandle(arg, "function")) {
                        var handle = arg;
                        arg = function () {
                            var sendArgs = Array.prototype.slice.call(arguments, 0);
                            var sendInfo = { args: sendArgs, callback: handle };
                            return me.worker.postMessage(sendInfo);
                        };
                    }
                }
                else if (me.platform === "browser") {
                    if (typeof arg === "function") {
                        arg = me.core.handle.push(arg, typeof arg);
                    }
                }
                return arg;
            });
        }
        info.args = args;
    };
    me.releaseArgs = function (info) {
        var args = info.args;
        if (args) {
            args = args.map((arg) => {
                if (!arg) {
                    return null;
                }
                if (me.platform === "browser") {
                    if (typeof arg === "string") {
                        if (me.core.handle.isHandle(arg, "function")) {
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
