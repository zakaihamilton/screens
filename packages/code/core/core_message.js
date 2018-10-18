/*
 @author Zakai Hamilton
 @component CoreMessage
 */

screens.core.message = function CoreMessage(me) {
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
    me.send_service_worker = function (path, params) {
        var args = Array.prototype.slice.call(arguments, 0);
        if (me.platform === "browser" || me.platform === "client") {
            return me.send_info((info) => {
                return me.service_worker.postMessage(info);
            }, args);
        } else if (me.platform === "service_worker") {
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
        me.core.object.create(me, info);
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
        } else if (me.platform === "browser") {
            args.unshift("service");
            args.unshift("core.socket.sendFirst");
            return me.send_server.apply(this, args);
        }
    };
    me.send_platform = function (platform, path, params) {
        var args = Array.prototype.slice.call(arguments, 1);
        if (!platform) {
            platform = me.platform;
        }
        return me["send_" + platform].apply(null, args);
    };
    me.processArg = function (info, arg) {
        if (Array.isArray(arg)) {
            arg = arg.map((subArg) => {
                return me.processArg(info, subArg);
            });
            return arg;
        }
        if (typeof arg === "object") {
            for (var key in arg) {
                arg[key] = me.processArg(info, arg[key]);
            }
            return arg;
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
            else if (arg instanceof Element) {
                arg = me.core.handle.push(arg, "element");
            }
        }
        return arg;
    };
    me.prepareArgs = function (info) {
        var args = info.args;
        if (args) {
            args = args.map((arg) => {
                if (!arg) {
                    return null;
                }
                arg = me.processArg(info, arg);
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
                        if (me.core.handle.isHandle(arg, "element")) {
                            arg = me.core.handle.pop(arg, "element");
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
            callback = screens.lookup(path);
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
        if (!args || !args.length) {
            return;
        }
        try {
            var result = await me.send.apply(_this, args);
            return [null, result];
        }
        catch (err) {
            me.log("args: " + JSON.stringify(args) + " error: " + err.toString());
            return [err];
        }
    };
    me.headers = function (info) {

    };
};

screens.core.message.worker = function CoreMessageWorker(me) {
    me.init = async function () {
        if (me.platform === "browser") {
            me.PromiseWorker = await me.core.require.load("/node_modules/promise-worker/dist/promise-worker.js");
        }
        if(me.platform === "client") {
            await me.import('/node_modules/promise-worker/dist/promise-worker.register.js');
            me.register();
        }
    };
    me.register = function () {
        registerPromiseWorker(async (info) => {
            if (!info) {
                return;
            }
            if (info.callback) {
                info.callback = me.core.handle.find(info.callback, "function");
                if (info.callback) {
                    return await info.callback.apply(null, info.args);
                }
            }
            else {
                me.core.object.create(me, info);
                me.core.message.prepareArgs(info);
                var args = await me.core.message.send.apply(null, info.args);
                me.core.message.releaseArgs(info);
                return args;
            }
        });
    };
    me.load = async function (path) {
        me.handle = new me.PromiseWorker(new Worker(path));
        me.handle.postMessage(null);
    };
    me.postMessage = function (info) {
        if (me.handle) {
            return me.handle.postMessage(info);
        }
    };
};

screens.core.message.service_worker = function CoreMessageServiceWorker(me) {
    me.init = async function() {
        if (me.platform === "browser") {
            me.PromiseWorker = await me.core.require.load("/node_modules/promise-worker/dist/promise-worker.js");
        }
        if(me.platform === "service_worker") {
            await me.import('/node_modules/promise-worker/dist/promise-worker.register.js');
            me.register();
            me.core.event.register(null, self, "activate", me.activate);
        }
    };
    me.activate = async function(object, event) {
        await self.clients.claim();
    };
    me.load = async function (path) {
        if ('serviceWorker' in navigator) {
            me.log("Service worker registeration for path: " + path);
            try {
                var reg = await navigator.serviceWorker.register(path);
                reg.update();
                me.log("Service worker registeration complete for path: " + path);
                if (!navigator.serviceWorker.controller) {
                    await new Promise(function (resolve) {
                        function onControllerChange() {
                            navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
                            resolve(navigator.serviceWorker);
                        }
                        navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
                    });
                }
                me.handle = new me.PromiseWorker(navigator.serviceWorker);
            }
            catch (err) {
                me.log("Service worker registeration failed for path: " + path + " err: " + err);
            }
        }
        else {
            me.log("Service worker not supported");
        }
    };
    me.postMessage = function (info) {
        if (me.handle) {
            return me.handle.postMessage(info);
        }
    };
    me.register = function () {
        registerPromiseWorker(async (info) => {
            if (!info) {
                return;
            }
            if (info.callback) {
                info.callback = me.core.handle.find(info.callback, "function");
                if (info.callback) {
                    return await info.callback.apply(null, info.args);
                }
            }
            else {
                me.core.object.create(me, info);
                me.core.message.prepareArgs(info);
                var args = await me.core.message.send.apply(null, info.args);
                me.core.message.releaseArgs(info);
                return args;
            }
        });
    };
};
