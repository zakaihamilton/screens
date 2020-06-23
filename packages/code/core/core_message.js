/*
 @author Zakai Hamilton
 @component CoreMessage
 */

screens.core.message = function CoreMessage(me, { core }) {
    me.send_server = function (...params) {
        if (me.platform === "server") {
            return me.send(...params);
        }
        else if (me.platform === "client") {
            params.unshift("core.message.send_server");
            return me.send_browser(...params);
        }
        else {
            return core.interface.send(...params);
        }
    };
    me.send_browser = function (...params) {
        if (me.platform === "client") {
            return me.send_info((info) => {
                return me.worker.postMessage(info);
            }, params);
        } else if (me.platform === "browser") {
            return me.send.call(this, ...params);
        } else if (me.platform === "server") {
            return core.interface.send(...params);
        }
    };
    me.send_client = function (...params) {
        if (me.platform === "browser") {
            return me.send_info((info) => {
                return me.worker.postMessage(info);
            }, params);
        } else if (me.platform === "client") {
            return me.send.call(this, ...params);
        }
    };
    me.send_service_worker = function (...params) {
        if (me.platform === "browser" || me.platform === "client") {
            return me.send_info((info) => {
                return me.service_worker.postMessage(info);
            }, params);
        } else if (me.platform === "service_worker") {
            return me.send.call(this, ...params);
        }
    };
    me.send_info = async function (send_callback, args) {
        var info = {
            args,
            headers: {},
            platform: me.platform
        };
        me.prepareArgs(info);
        core.property.object.create(me, info);
        await core.property.set(info, "headers", null);
        var result = send_callback(info);
        return result;
    };
    me.send_platform = function (platform, ...params) {
        if (!platform) {
            platform = me.platform;
        }
        return me["send_" + platform](...params);
    };
    me.processArg = function (info, arg) {
        if (Array.isArray(arg)) {
            arg = arg.map((subArg) => {
                return me.processArg(info, subArg);
            });
            return arg;
        }
        if (me.platform === "browser") {
            if (Element && arg instanceof Element) {
                arg = core.handle.push(arg, "element");
                return arg;
            }
        }
        if (typeof arg === "object") {
            for (var key in arg) {
                arg[key] = me.processArg(info, arg[key]);
            }
            return arg;
        }
        if (me.platform === "client") {
            if (core.handle.isHandle(arg, "function")) {
                let handle = arg;
                arg = function (...params) {
                    var sendInfo = { args: params, callback: handle };
                    return me.worker.postMessage(sendInfo);
                };
            }
        }
        else if (me.platform === "browser") {
            if (typeof arg === "function") {
                arg = core.handle.push(arg, typeof arg);
            }
            else if (arg instanceof Element) {
                arg = core.handle.push(arg, "element");
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
                        if (core.handle.isHandle(arg, "function")) {
                            arg = core.handle.pop(arg, "function");
                        }
                        if (core.handle.isHandle(arg, "element")) {
                            arg = core.handle.pop(arg, "element");
                        }
                    }
                }
                return arg;
            });
        }
        info.args = args;
    };
    me.send = function (path, ...params) {
        var callback = null;
        var result = null;
        if (!path) {
            return undefined;
        }
        if (typeof path === "function") {
            result = path.call(this, ...params);
            return result;
        }
        try {
            callback = screens.browse(path);
        } catch (error) {
            //me.log(error);
            return undefined;
        }
        if (typeof callback === "function") {
            result = callback.call(this, ...params);
            return result;
        } else if (typeof callback !== "undefined") {
            me.log("callback for " + path + " is not a function but rather " + JSON.stringify(callback));
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
            var err_text = err;
            if (err && err.message) {
                err_text = err.message;
            }
            else if (typeof err === "object") {
                err_text = JSON.stringify(err);
            }
            else if (typeof err !== "string") {
                err_text = err.toString();
            }
            me.log_error("failed local call, args: " + JSON.stringify(args) + " error: " + err_text);
            return [err_text];
        }
    };
    me.headers = function () {

    };
};

screens.core.message.worker = function CoreMessageWorker(me, { core }) {
    me.init = async function () {
        if (me.platform === "client") {
            // eslint-disable-next-line no-undef
            me.handle = new self.exports.PWBWorker();
            me.register();
        }
    };
    me.register = function () {
        me.handle.register(async (info) => {
            if (!info) {
                return;
            }
            if (info.callback) {
                info.callback = core.handle.find(info.callback, "function");
                if (info.callback) {
                    return await info.callback.apply(null, info.args);
                }
            }
            else {
                core.property.object.create(me, info);
                core.message.prepareArgs(info);
                var args = await core.message.send.apply(null, info.args);
                core.message.releaseArgs(info);
                return args;
            }
        });
    };
    me.load = async function (path) {
        // eslint-disable-next-line no-undef
        me.handle = new window.PWBHost(new Worker(path));
        me.register();
        me.handle.postMessage(null);
    };
    me.postMessage = function (info) {
        if (me.handle) {
            return me.handle.postMessage(info);
        }
    };
};

screens.core.message.service_worker = function CoreMessageServiceWorker(me, { core }) {
    me.init = async function () {
        if (me.platform === "service_worker") {
            await screens.import("/node_modules/promise-worker/dist/promise-worker.register.js");
            me.register();
            core.event.register(null, self, "activate", me.activate);
        }
    };
    me.activate = async function () {
        await self.clients.claim();
    };
    me.unregister = async function () {
        let result = false;
        if (me.reg) {
            result = await me.reg.unregister();
        }
        return result;
    };
    me.load = async function (path) {
        me.path = path;
        if ("serviceWorker" in navigator) {
            me.log("Service worker registeration for path: " + path);
            try {
                var reg = await navigator.serviceWorker.register(path);
                reg.update();
                me.reg = reg;
                me.log("Service worker registeration complete for path: " + path);
                if (!navigator.serviceWorker.controller) {
                    await new Promise(function (resolve) {
                        function onControllerChange() {
                            navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
                            resolve(navigator.serviceWorker);
                        }
                        navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
                    });
                }
                // eslint-disable-next-line no-undef
                me.handle = new PromiseWorker(navigator.serviceWorker);
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
        if (me.platform === "browser") {
            me.load(me.path);
        }
        else {
            // eslint-disable-next-line no-undef
            registerPromiseWorker(async (info) => {
                if (!info) {
                    return;
                }
                if (info.callback) {
                    info.callback = core.handle.find(info.callback, "function");
                    if (info.callback) {
                        return await info.callback.apply(null, info.args);
                    }
                }
                else {
                    core.property.object.create(me, info);
                    core.message.prepareArgs(info);
                    var args = await core.message.send.apply(null, info.args);
                    core.message.releaseArgs(info);
                    return args;
                }
            });
        }
    };
};
