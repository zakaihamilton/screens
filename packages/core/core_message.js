/*
    @author Zakai Hamilton
    @component CoreMessage
*/

package.core.message = new function CoreMessage() {
    var me = this;
    var core = package.core;
    core.event.forward("core.http", "core.message", true);
    me.send_server = function(path, params) {
        if(core.platform !== "server") {
            var args = Array.prototype.slice.call(arguments, 1);
            var info = {method:"GET",
                        url:"/method/" + path + package.core.type.wrap_args(args)};
            var result = core.http.send(info);
            return core.type.unwrap(result);
        }
        else if(core.platform == "server") {
            var args = Array.prototype.slice.call(arguments, 1);
            var info = {path:method,params:args};
            package.core.console.log(JSON.stringify(info));
            me.send(info);
        }
    };
    me.send_client = function(path, params) {
        var args = Array.prototype.slice.call(arguments, 1);
        var info = {path:path,params:args};
        package.core.console.log(JSON.stringify(info));
        if(core.platform === "browser") {
            me.worker.postMessage(info);
        }
        else if(core.platform === "client") {
            me.send(info);
        }
    };
    me.send_browser = function(path, params) {
        var args = Array.prototype.slice.call(arguments, 1);
        var info = {path:path,params:args};
        package.core.console.log(JSON.stringify(info));
        if(core.platform === "client") {
            self.postMessage(info);
        }
        else if(core.platform === "browser") {
            me.send(info);
        }
    };
    me.receive = function(info) {
        core.console.log("matching url: " + info.url);
        if(core.platform === "server" && info.method === "GET" && info.url.startsWith("/method/")) {
            var find = "/method/";
            var path = info.url.substring(info.url.indexOf(find)+find.length);
            var args = core.type.unwrap_args(info.query);
            var message={path:path,params:args};
            core.console.log("executing path: " + path);
            var result = core.message.send(message);
            info.body = core.type.wrap(result);
        }
    };
    me.send = function(info) {
        var component = null;
        var method = null;
        if(info.path) {
            var offset = info.path.lastIndexOf(".");
            if(info.path.indexOf(".") !== offset) {
                component = info.path.substring(0, offset);
                method = info.path.substring(offset+1);
            }
            else {
                method = info.path;
            }
        }
        if(info.component) {
            component = info.component;
        }
        if(info.method) {
            method = info.method;
        }
        if(info.prefix) {
            method = info.prefix + method;
        }
        if(info.suffix) {
            method = method + info.suffix;
        }
        var callback = null;
        try {
            callback = package[component + "." + method];
        }
        catch(error) {
            package.core.console.log(error);
            return undefined;
        }
        package.core.console.log("method: " + component + "." + method + " params: [" + info.params + "] callback: " + callback);
        if(typeof callback === "function") {
            return callback.apply(package[component], info.params);
        }
    };
    if(core.platform === "browser") {
        me.worker = new Worker("packages/platform/client.js");
        me.worker.onmessage = function(event) { return package.core.message.send(event.data); };
    }
    else if(core.platform === "client") {
        self.onmessage = function(event) { return package.core.message.send(event.data); };
    }
};
