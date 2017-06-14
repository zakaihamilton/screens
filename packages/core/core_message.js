/*
    @author Zakai Hamilton
    @component CoreMessage
*/

package.core.message = function CoreMessage(me) {
    var core = me.core;
    core.event.link("core.http", "core.message", true);
    me.init = function() {
        package.send_server = me.send_server;
        package.send_client = me.send_client;
        package.send_browser = me.send_browser;
        package.send = me.send;
    };
    me.send_server = function(path, params) {
        if(me.platform !== "server") {
            var args = Array.prototype.slice.call(arguments, 1);
            var info = {method:"GET",
                        url:"/method/" + path + me.core.type.wrap_args(args)};
            var result = core.http.send(info);
            return core.type.unwrap(result);
        }
        else if(me.platform === "server") {
            var args = Array.prototype.slice.call(arguments, 0);
            me.send.apply(null, args);
        }
    };
    me.send_client = function(path, params) {
        if(me.platform === "browser") {
            var args = Array.prototype.slice.call(arguments, 1);
            var info = {path:path,params:args};
            me.core.console.log(JSON.stringify(info));
            me.worker.postMessage(info);
        }
        else if(me.platform === "client") {
            var args = Array.prototype.slice.call(arguments, 0);
            me.send.apply(null, args);
        }
    };
    me.send_browser = function(path, params) {
        if(me.platform === "client") {
            var args = Array.prototype.slice.call(arguments, 1);
            var info = {path:path,params:args};
            me.core.console.log(JSON.stringify(info));
            self.postMessage(info);
        }
        else if(me.platform === "browser") {
            var args = Array.prototype.slice.call(arguments, 0);
            me.send.apply(null, args);
        }
    };
    me.receive = function(info) {
        core.console.log("matching url: " + info.url);
        if(me.platform === "server" && info.method === "GET" && info.url.startsWith("/method/")) {
            var find = "/method/";
            var path = info.url.substring(info.url.indexOf(find)+find.length);
            var args = core.type.unwrap_args(info.query);
            args.unshift(path);
            var result = core.message.send.apply(null, args);
            info.body = core.type.wrap(result);
        }
    };
    me.send = function(path, params) {
        var args = Array.prototype.slice.call(arguments, 1);
        var callback = null;
        try {
            callback = package[path];
        }
        catch(error) {
            me.core.console.log(error);
            return undefined;
        }
        me.core.console.log("sending: " + path + " with: " + JSON.stringify(args) + " callback: " +callback);
        if(typeof callback === "function") {
            return callback.apply(null, args);
        }
        else {
            me.core.console.log("callback is not a function but rather " + JSON.stringify(callback));
        }
    };
    if(me.platform === "browser") {
        me.worker = new Worker("packages/platform/client.js");
        me.worker.onmessage = function(event) {
            var args = event.data.params;
            args.unshift(event.data.path);
            return me.send.apply(null, args);
        };
    }
    else if(me.platform === "client") {
        self.onmessage = function(event) {
            var args = event.data.params;
            args.unshift(event.data.path);
            return me.send.apply(null, args);
        };
    }
};
