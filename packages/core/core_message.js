/*
    @author Zakai Hamilton
    @component CoreMessage
*/

package.core.message = new function CoreMessage() {
    var core = package.core;
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
        var component = info.method.substring(0, info.method.lastIndexOf("."));
        var method = package[info.method];
        package.core.console.log("method: " + info.method + " component: " + component);
        return method.apply(package[component], info.params);
    };
    if(core.platform == "browser") {
        this.worker = new Worker("packages/package.js");
        this.worker.onmessage = function(event) { return package.core.message.receive(event.data); };
    }
    else if(core.platform == "client") {
        self.onmessage = function(event) { return package.core.message.receive(event.data); };
    }
};
