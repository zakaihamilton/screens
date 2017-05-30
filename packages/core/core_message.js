/*
    @author Zakai Hamilton
    @component CoreMessage
*/

package.core.message = new function CoreMessage() {
    var core = package.core;
    core.event.forward("core.http", "core.message", true);
    this.send_server = function(method, params) {
        if(core.platform !== "server") {
            var args = Array.prototype.slice.call(arguments, 1);
            var info = {method:"GET",
                        url:"/method/" + method + package.core.type.wrap_args(args)};
            var result = core.http.send(info);
            return core.type.unwrap(result);
        }
    };
    this.send_client = function(method, params) {
        if(core.platform === "browser") {
            var args = Array.prototype.slice.call(arguments, 1);
            var info = {method:method,params:args};
            this.worker.postMessage(info);
        }
    };
    this.send_browser = function(method, params) {
        if(core.platform === "client") {
            var args = Array.prototype.slice.call(arguments, 1);
            var info = {method:method,params:args};
            package.core.console.log(JSON.stringify(info));
            self.postMessage(info);
        }
    };
    this.receive = function(info) {
        core.console.log("matching url: " + info.url);
        if(core.platform == "server" && info.method == "GET" && info.url.startsWith("/method/")) {
            var find = "/method/";
            var method = info.url.substring(info.url.indexOf(find)+find.length);
            var args = core.type.unwrap_args(info.query);
            var message={method:method,params:args};
            core.console.log("executing method: " + method);
            var result = core.message.execute(message);
            info.body = core.type.wrap(result);
        }
    };
    this.execute = function(info) {
        var component = info.method.substring(0, info.method.lastIndexOf("."));
        var method = package[info.method];
        package.core.console.log("method: " + info.method + " component: " + component);
        return method.apply(package[component], info.params);
    };
    if(core.platform == "browser") {
        this.worker = new Worker("packages/package.js");
        this.worker.onmessage = function(event) { return package.core.message.execute(event.data); };
    }
    else if(core.platform == "client") {
        self.onmessage = function(event) { return package.core.message.execute(event.data); };
    }
};
