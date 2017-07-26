/*
 @author Zakai Hamilton
 @component CoreMessage
 */

package.core.message = function CoreMessage(me) {
    var core = me.core;
    me.init = function () {
        package.send_server = me.send_server;
        package.send_client = me.send_client;
        package.send_browser = me.send_browser;
        package.send = me.send;
        core.property.link("core.http.receive", "core.message.receive", true);
    };
    me.send_server = function (path, callback, params) {
        if (me.platform !== "server") {
            var args = Array.prototype.slice.call(arguments, 1);
            args[0] = null;
            var info = {method: "GET",
                url: "/method/" + path + me.core.type.wrap_args(args),
                callback: me.handleRemote,
                altCallback:callback
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
            var info = {path: path, params: args, callback:me.core.handle.push(callback)};
            me.core.console.log(JSON.stringify(info));
            me.worker.postMessage(info);
        } else if (me.platform === "client") {
            var args = Array.prototype.slice.call(arguments, 0);
            me.send.apply(null, args);
        }
    };
    me.send_browser = function (path, callback, params) {
        if (me.platform === "client") {
            var args = Array.prototype.slice.call(arguments, 1);
            args[0] = null;
            var info = {path: path, params: args, callback:me.core.handle.push(callback)};
            me.core.console.log(JSON.stringify(info));
            postMessage(info);
        } else if (me.platform === "browser") {
            var args = Array.prototype.slice.call(arguments, 0);
            me.send.apply(null, args);
        }
    };
    me.receive = {
        set: function (info) {
            core.console.log("matching url: " + info.url);
            if (me.platform === "server" && info.method === "GET" && info.url.startsWith("/method/")) {
                var find = "/method/";
                var path = info.url.substring(info.url.indexOf(find) + find.length);
                var args = core.type.unwrap_args(info.query);
                args.unshift(path);
                var task = core.job.begin(info.job);
                args[1] = function(response) {
                    info.body = core.type.wrap(response);
                    core.job.end(task);
                };
                core.message.send.apply(null, args);
            }
        }
    };
    me.send = function (path, params) {
        var args = Array.prototype.slice.call(arguments, 1);
        var callback = null;
        try {
            callback = me[path];
        } catch (error) {
            //me.core.console.log(error);
            return undefined;
        }
        me.core.console.log("sending: " + path + " with: " + args);
        if (typeof callback === "function") {
            var result = callback.apply(null, args);
            return result;
        } else {
            me.core.console.log("callback is not a function but rather " + JSON.stringify(callback));
        }
    };
    if (me.platform === "browser") {
        me.worker = new Worker("packages/platform/client.js");
        me.worker.onmessage = function (event) {
            me.handleLocal(me.worker, event.data);
        };
    } else if (me.platform === "client") {
        self.onmessage = function (event) {
            me.handleLocal(null, event.data);
        };
    }
    me.handleRemote = function(info) {
        if(info.altCallback) {
            info.response = core.type.unwrap(info.response);
            info.altCallback(info.response);
        }
    };
    me.handleLocal = function(context, info) {
        if(typeof info.response !== "undefined") {
            var callback = me.core.handle.pop(info.callback);
            if(callback) {
                callback(info.response);
            }
            return;
        }
        var args = info.params;
        args.unshift(info.path);
        var response = me.send.apply(null, args);
        info.response = response ? response : null;
        if(context) {
            context.postMessage(info);
        }
        else {
            self.postMessage(info);
        }
    };
};
