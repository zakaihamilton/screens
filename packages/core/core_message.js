/*
 @author Zakai Hamilton
 @component CoreMessage
 */

package.core.message = function CoreMessage(me) {
    var core = me.package.core;
    me.init = function () {
        if (package.platform === "server") {
            me.package.core.property.link("core.http.receive", "core.message.receive", true);
        } else if (me.package.platform === "browser") {
            package.worker.onmessage = function (event) {
                me.package.core.console.log("Receiving message");
                me.handleLocal(package.worker, event.data);
            };
            package.worker.postMessage(null);
        } else if (me.package.platform === "client") {
            self.onmessage = function (event) {
                me.package.core.console.log("Receiving message");
                me.handleLocal(null, event.data);
            };
        }
    };
    me.send_server = function (path, callback, params) {
        if (me.package.platform !== "server") {
            var args = Array.prototype.slice.call(arguments, 1);
            args[0] = null;
            var info = {method: "POST",
                url: "/method/" + path,
                callback: me.handleRemote,
                altCallback: callback,
                body: me.package.core.type.wrap_args(args)
            };
            core.http.send(info);
        } else if (me.package.platform === "server") {
            var args = Array.prototype.slice.call(arguments, 0);
            me.send.apply(null, args);
        }
    };
    me.send_client = function (path, callback, params) {
        if (me.package.platform === "browser") {
            var args = Array.prototype.slice.call(arguments, 1);
            args[0] = null;
            var info = {path: path, params: args, callback: me.package.core.handle.push(callback)};
            me.package.core.console.log(JSON.stringify(info));
            package.worker.postMessage(info);
        } else if (me.package.platform === "client") {
            var args = Array.prototype.slice.call(arguments, 0);
            me.send.apply(null, args);
        }
    };
    me.send_browser = function (path, callback, params) {
        if (me.package.platform === "client") {
            var args = Array.prototype.slice.call(arguments, 1);
            args[0] = null;
            var info = {path: path, params: args, callback: me.package.core.handle.push(callback)};
            me.package.core.console.log(JSON.stringify(info));
            postMessage(info);
        } else if (me.package.platform === "browser") {
            var args = Array.prototype.slice.call(arguments, 0);
            me.send.apply(null, args);
        }
    };
    me.receive = {
        set: function (info) {
            me.package.core.console.log("matching url: " + info.url);
            if (me.package.platform === "server" && info.method === "POST" && info.url.startsWith("/method/")) {
                var find = "/method/";
                var path = info.url.substring(info.url.indexOf(find) + find.length);
                var args = core.type.unwrap_args(core.http.parse_query(info.body));
                info.body = null;
                args.unshift(path);
                var task = core.job.begin(info.job);
                args[1] = function (response) {
                    var args = Array.prototype.slice.call(arguments, 0);
                    info.body = core.type.wrap_args(args);
                    core.job.end(task);
                };
                try {
                    core.message.send.apply(null, args);
                }
                catch(e) {
                    me.package.core.console.log("error: " + e.message + " " + JSON.stringify(args));
                    info.body = e.message;
                    core.job.end(task);
                }
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
            var result = path.apply(null, args);
            return result;
        }
        try {
            callback = package.path(path);
        } catch (error) {
            //me.package.core.console.log(error);
            return undefined;
        }
        me.package.core.console.log("sending: " + path + " with: " + args);
        if (typeof callback === "function") {
            var result = callback.apply(null, args);
            return result;
        } else {
            me.package.core.console.log("callback is not a function but rather " + JSON.stringify(callback));
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
            var callback = me.package.core.handle.pop(info.callback);
            if (callback) {
                callback.apply(null, info.response);
            }
            return;
        }
        me.package.core.console.log("info: " + JSON.stringify(info));
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
