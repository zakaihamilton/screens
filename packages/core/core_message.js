/*
    @author Zakai Hamilton
    @component CoreMessage
*/

package.core.message = new function CoreMessage() {
    var core = package.core;
    core.event.forward("core.http", "core.message", true);
    this.send_server = function(path, params) {
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
            this.execute(info);
        }
    };
    this.send_client = function(path, params) {
        var args = Array.prototype.slice.call(arguments, 1);
        var info = {path:path,params:args};
        package.core.console.log(JSON.stringify(info));
        if(core.platform === "browser") {
            this.worker.postMessage(info);
        }
        else if(core.platform === "client") {
            this.execute(info);
        }
    };
    this.send_browser = function(path, params) {
        var args = Array.prototype.slice.call(arguments, 1);
        var info = {path:path,params:args};
        package.core.console.log(JSON.stringify(info));
        if(core.platform === "client") {
            self.postMessage(info);
        }
        else if(core.platform === "browser") {
            this.execute(info);
        }
    };
    this.receive = function(info) {
        core.console.log("matching url: " + info.url);
        if(core.platform === "server" && info.method === "GET" && info.url.startsWith("/method/")) {
            var find = "/method/";
            var path = info.url.substring(info.url.indexOf(find)+find.length);
            var args = core.type.unwrap_args(info.query);
            var message={path:path,params:args};
            core.console.log("executing path: " + path);
            var result = core.message.execute(message);
            info.body = core.type.wrap(result);
        }
    };
    this.execute = function(info) {
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
        var callback = package[component + "." + method];
        package.core.console.log("method: " + component + "." + method + " params: [" + info.params + "] callback: " + callback);
        if(typeof callback === "function") {
            return callback.apply(package[component], info.params);
        }
    };
    if(core.platform == "browser") {
        this.worker = new Worker("packages/platform/client.js");
        this.worker.onmessage = function(event) { return package.core.message.execute(event.data); };
    }
    else if(core.platform == "client") {
        self.onmessage = function(event) { return package.core.message.execute(event.data); };
    }
};
