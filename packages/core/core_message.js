/*
    @author Zakai Hamilton
    @component CoreMessage
*/

package.core.message = new function CoreMessage() {
    this.send_server = function(method, params) {
        if(platform == "server") {
            var args = Array.prototype.slice.call(arguments, 1);
            var info = {method:"GET",
                        url:"method/@component." + method + "(" + package.core.type.wrap_args(args) + ")"};
            var result = package.core.http.send(info);
            return package.core.type.unwrap(result);
        }
    };
    this.send_client = function(method, params) {
        var args = Array.prototype.slice.call(arguments, 1);
        var info = {method:method,params:args};
        this.worker.postMessage(info);
    };
    this.send_browser = function(method, params) {
        var args = Array.prototype.slice.call(arguments, 1);
        var info = {method:method,params:args};
        postMessage(info);
    };
    this.receive_client = function(info) {
        var component = info.method.substring(0, info.method.lastIndexOf("."));
        package[info.method].apply(component, info.params);
    };
    this.receive_browser = function(info) {
        var component = info.method.substring(0, info.method.lastIndexOf("."));
        package[info.method].apply(component, info.params);
    };
    console.log("platform:" + package.core.platform);
    if(package.core.platform == "browser") {
        this.worker = new Worker("packages/package.js");
        this.worker.addEventListener("message", this.receive_browser);
    }
    else if(package.core.platform == "client") {
        addEventListener("message", this.receive_client);
    }
};
