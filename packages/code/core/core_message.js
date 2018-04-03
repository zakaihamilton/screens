/*
 @author Zakai Hamilton
 @component me.coreMessage
 */

screens.core.message = function CoreMessage(me) {
    me.init = function () {
        if (screens.platform === "server") {
            me.core.property.link("core.http.receive", "core.message.receiveHttp", true);
        } else if (me.platform === "browser") {

        } else if (me.platform === "client") {
            self.onmessage = function (event) {
                me.log("Receiving message");
                me.handleLocal(self.postMessage, event.data);
            };
        }
    };
    me.waitForWorker = async function () {
        return new Promise((resolve, reject) => {
            me.core.listener.wait(resolve, me.id);
        });
    };
    me.loadWorker = function (path) {
        screens.worker = new Worker(path);
        screens.worker.onmessage = function (event) {
            me.log("Receiving message");
            me.handleLocal((info) => {
                screens.worker.postMessage(info);
            }, event.data);
        };
        screens.worker.postMessage(null);
    };
    me.workerReady = async function () {
        return new Promise((resolve, reject) => {
            if (me.platform === "client") {
                me.send_browser("core.listener.signal", () => {
                    resolve();
                }, me.id);
            }
        });
    };
    me.send_server = function (path, callback, params) {
        if (me.platform === "service") {
            return new Promise((resolve, reject) => {
                var responseCallback = (err, result) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(result);
                    }
                    if (callback) {
                        callback(err, result);
                    }
                };
                var args = Array.prototype.slice.call(arguments, 1);
                args[0] = null;
                var info = {
                    path: path,
                    params: me.core.type.wrap_args(args),
                    callback: me.core.handle.push(responseCallback)
                };
            });
            me.core.service.client.emit("method", info);
        }
        else if (me.platform !== "server") {
            var args = Array.prototype.slice.call(arguments, 1);
            args[0] = null;
            var info = {
                method: "POST",
                url: "/method/" + path,
                altCallback: callback,
                body: me.core.type.wrap_args(args)
            };
            me.core.http.send(me.handleRemote, info);
        } else if (me.platform === "server") {
            var args = Array.prototype.slice.call(arguments, 0);
            return me.send.apply(null, args);
        }
    };
    me.send_client = function (path, callback, params) {
        if (me.platform === "browser") {
            return new Promise((resolve, reject) => {
                var responseCallback = (err, result) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(result);
                    }
                    if (callback) {
                        callback(err, result);
                    }
                };
                var args = Array.prototype.slice.call(arguments, 1);
                args[0] = null;
                var info = {
                    path: path,
                    params: args,
                    callback: me.core.handle.push(responseCallback)
                };
                screens.worker.postMessage(info);
            });
        } else if (me.platform === "client") {
            var args = Array.prototype.slice.call(arguments, 0);
            return me.send.apply(this, args);
        }
    };
    me.send_service = function (path, callback, params) {
        if (me.platform === "server") {
            return new Promise((resolve, reject) => {
                var responseCallback = (err, result) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(result);
                    }
                    if (callback) {
                        callback(err, result);
                    }
                };
                var args = Array.prototype.slice.call(arguments, 1);
                args[0] = null;
                var info = {
                    path: path,
                    params: me.core.type.wrap_args(args),
                    callback: me.core.handle.push(responseCallback)
                };
                this.emit("method", info);
            });
        } else if (me.platform === "service") {
            var args = Array.prototype.slice.call(arguments, 0);
            return me.send.apply(this, args);
        }
    };
    me.send_platform = function (platform, path, callback, params) {
        var args = Array.prototype.slice.call(arguments, 1);
        if (!platform) {
            platform = me.platform;
        }
        return me["send_" + platform].apply(null, args);
    };
    me.send_browser = function (path, callback, params) {
        if (me.platform === "client") {
            return new Promise((resolve, reject) => {
                var responseCallback = (err, result) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(result);
                    }
                    if (callback) {
                        callback(err, result);
                    }
                };
                var args = Array.prototype.slice.call(arguments, 1);
                args[0] = null;
                var info = { path: path, params: args, callback: me.core.handle.push(responseCallback) };
                postMessage(info);
            });
        } else if (me.platform === "browser") {
            var args = Array.prototype.slice.call(arguments, 0);
            return me.send.apply(null, args);
        }
    };
    me.receiveHttp = {
        set: function (info) {
            me.log("matching url: " + info.url);
            if (me.platform === "server" && info.method === "POST" && info.url.startsWith("/method/")) {
                var find = "/method/";
                var path = info.url.substring(info.url.indexOf(find) + find.length);
                var args = me.core.type.unwrap_args(me.core.http.parse_query(info.body));
                info.body = null;
                args.unshift(path);
                me.lock(info.task, task => {
                    args[1] = function (response) {
                        var args = Array.prototype.slice.call(arguments, 0);
                        info.body = me.core.type.wrap_args(args);
                        me.unlock(task);
                    };
                    try {
                        args = args.map((arg) => {
                            if (arg && typeof arg === "string" && arg.includes("$user")) {
                                me.log("replacing: $user with: " + info.user + " arg: " + arg);
                                arg = arg.replace(/\$user/, info.user);
                            }
                            return arg;
                        });
                        var promise = me.core.message.send.apply(info, args);
                        me.log("result on: " + path + " promise: " + promise);
                        if (promise && promise.then) {
                            me.log("waiting for promise on: " + path);
                            promise.then((result) => {
                                me.log("promise resolved " + path);
                                var args = [null, result];
                                info.body = me.core.type.wrap_args(args);
                                me.unlock(task);
                            }).catch((err) => {
                                me.log("promise catch " + path);
                                me.error(e.message || e + " " + JSON.stringify(args), e.stack || "");
                                info.body = me.core.type.wrap_args([e]);
                                me.unlock(task);
                            });
                        }
                    }
                    catch (e) {
                        me.error(e.message + " " + JSON.stringify(args), e.stack);
                        info.body = e.message;
                        me.unlock(task);
                    }
                });
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
    me.handleRemote = function (info) {
        info.response = me.core.type.unwrap_args(info.response);
        if (!info.response) {
            info.response = [];
        }
        if (info.altCallback) {
            info.altCallback.apply(null, info.response);
        }
    };
    me.handleLocal = function (callback, info, remote) {
        if (!info) {
            return;
        }
        info = Object.assign({}, info);
        if (typeof info.response !== "undefined") {
            if (remote) {
                info.response = me.core.type.unwrap_args(info.response);
            }
            var infoCallback = me.core.handle.pop(info.callback);
            if (infoCallback) {
                infoCallback.apply(info, info.response);
            }
            return;
        }
        if (remote) {
            info.params = me.core.type.unwrap_args(info.params);
        }
        var args = info.params;
        args.unshift(info.path);
        var responseCallback = info.callback;
        var resolveCallback = function (result) {
            var args = Array.prototype.slice.call(arguments, 0);
            info.params = null;
            info.response = args;
            info.callback = responseCallback;
            if (remote) {
                info.response = me.core.type.wrap_args(info.response);
            }
            if (callback) {
                callback(info);
            }
        };
        args[1] = resolveCallback;
        var promise = me.send.apply(info, args);
        if (promise && promise.then) {
            promise.then(result => {
                resolveCallback(null, result);
            }).catch(err => {
                resolveCallback(err);
            });
        }
    };
};
