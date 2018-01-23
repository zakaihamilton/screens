/*
 @author Zakai Hamilton
 @component CoreMessage
 */

package.core.message = function CoreMessage(me) {
    var core = me.core;
    me.init = function () {
        if (package.platform === "server") {
            me.core.property.link("core.http.receive", "core.message.receive", true);
        } else if (me.platform === "browser") {
            package.worker.onmessage = function (event) {
                me.core.console.log("Receiving message");
                me.handleLocal(package.worker, event.data);
            };
            package.worker.postMessage(null);
        } else if (me.platform === "client") {
            self.onmessage = function (event) {
                me.core.console.log("Receiving message");
                me.handleLocal(null, event.data);
            };
        }
    };
    me.send_server = function (path, callback, params) {
        if (me.platform !== "server") {
            var args = Array.prototype.slice.call(arguments, 1);
            args[0] = null;
            var info = {method: "POST",
                url: "/method/" + path,
                callback: me.handleRemote,
                altCallback: callback,
                body: me.core.type.wrap_args(args)
            };
            core.http.send(info);
        } else if (me.platform === "server") {
            var args = Array.prototype.slice.call(arguments, 0);
            me.send.apply(null, args);
        }
    };
    me.send_client = function (path, callback, params) {
        if (me.platform === "browser") {
            var args = Array.prototype.slice.call(arguments, 1);
            args[0] = null;
            var info = {path: path, params: args, callback: me.core.handle.push(callback)};
            me.core.console.log(JSON.stringify(info));
            package.worker.postMessage(info);
        } else if (me.platform === "client") {
            var args = Array.prototype.slice.call(arguments, 0);
            me.send.apply(null, args);
        }
    };
    me.send_browser = function (path, callback, params) {
        if (me.platform === "client") {
            var args = Array.prototype.slice.call(arguments, 1);
            args[0] = null;
            var info = {path: path, params: args, callback: me.core.handle.push(callback)};
            me.core.console.log(JSON.stringify(info));
            postMessage(info);
        } else if (me.platform === "browser") {
            var args = Array.prototype.slice.call(arguments, 0);
            me.send.apply(null, args);
        }
    };
    me.receive = {
        set: function (info) {
            me.core.console.log("matching url: " + info.url);
            if (me.platform === "server" && info.method === "POST" && info.url.startsWith("/method/")) {
                var find = "/method/";
                var path = info.url.substring(info.url.indexOf(find) + find.length);
                var args = core.type.unwrap_args(core.http.parse_query(info.body));
                info.body = null;
                args.unshift(path);
                me.lock(info.task, task => {
                    args[1] = function (response) {
                        var args = Array.prototype.slice.call(arguments, 0);
                        info.body = core.type.wrap_args(args);
                        me.unlock(task);
                    };
                    try {
                        core.message.send.apply(info, args);
                    }
                    catch(e) {
                        me.core.console.log("error: " + e.message + " " + JSON.stringify(args));
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
        if(!path) {
            return undefined;
        }
        if (typeof path === "function") {
            var result = path.apply(this, args);
            return result;
        }
        try {
            callback = me.browse(path);
        } catch (error) {
            //me.core.console.log(error);
            return undefined;
        }
        me.core.console.log("sending: " + path + " with " + args.length + " arguments");
        if (typeof callback === "function") {
            var result = callback.apply(this, args);
            return result;
        } else {
            me.core.console.log("callback is not a function but rather " + JSON.stringify(callback));
        }
    };
    me.handleRemote = function (info) {
        if (info.altCallback) {
            var args = core.http.parse_query(info.response);
            info.response = core.type.unwrap_args(args);
            info.altCallback.apply(null, info.response);
        }
    };
    me.handleLocal = function (context, info) {
        if(!info) {
            return;
        }
        info = Object.assign({}, info);
        if (typeof info.response !== "undefined") {
            var callback = me.core.handle.pop(info.callback);
            if (callback) {
                callback.apply(null, info.response);
            }
            return;
        }
        me.core.console.log("info: " + JSON.stringify(info));
        var args = info.params;
        args.unshift(info.path);
        var responseCallback = info.callback;
        if(responseCallback) {
            args[1] = function(result) {
                var args = Array.prototype.slice.call(arguments, 0);
                info.params = null;
                info.response = args;
                info.callback = responseCallback;
                if (context) {
                    context.postMessage(info);
                } else {
                    self.postMessage(info);
                }
            };
        }
        me.send.apply(null, args);
    };
};
