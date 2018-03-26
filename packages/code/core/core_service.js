/*
 @author Zakai Hamilton
 @component CoreService
 */

package.core.service = function CoreService(me) {
    me.init = function() {
        if (me.platform === "server") {
            me.clients = new Map();
            me.core.http.io.on("connection", (socket) => {
                me.log(`Service connected [id=${socket.id}]`);
                var ref = me.core.ref.gen();
                socket.on("disconnect", () => {
                    var info = me.clients.get(socket);
                    if (info) {
                        me.clients.delete(socket);
                        me.log(`Service disconnected [id=${socket.id} name=${info.name} ref=${info.ref}]`);
                    }
                });
                socket.on("method", (info) => {
                    info.clientIp = socket.request.connection.remoteAddress;
                    me.core.message.handleLocal((response) => {
                        socket.emit("method", response);
                    }, info, true);
                });
                me.log("Service setup request for ref: " + ref);
                me.core.message.send_service.call(socket, "core.service.setup", (name, ref) => {
                    me.log("Service setup complete for service: " + name + " ref: " + ref);
                    me.clients.set(socket, { ref: ref, name: name });
                    me.core.object(me, socket);
                    me.core.property.set(socket, "ready");
                }, ref);
            });
        } else if (me.platform === "service") {
            me.io = require("socket.io-client");
            if (process.argv.length <= 3) {
                me.log("params: http://ip:port service_name");
                process.exit(-1);
            }
            me.serverAddress = process.argv[2];
            me.serviceNames = process.argv.splice(3);
            me.log("Connecting to server: " + me.serverAddress);
            me.client = me.io.connect(me.serverAddress);
            me.client.on("connect", (socket) => {
                me.log("Connected to server: " + me.serverAddress);
                me.client.on("disconnect", (info) => {
                    me.log("Disconnected from server: " + me.serverAddress);
                });
                me.client.on("method", (info) => {
                    me.core.message.handleLocal((response) => {
                        me.client.emit("method", response);
                    }, info, true);
                });
            });
        }
    };
    me.list = function (callback) {
        var items = [];
        if (me.clients) {
            me.clients.forEach((value, key) => {
                items.push(value);
            });
        }
        callback(items);
    };
    me.setup = function (callback, ref) {
        if (me.alreadySetup) {
            callback(me.serviceNames, ref);
            return;
        }
        me.alreadySetup = true;
        me.lock((task) => {
            me.serviceNames.map((serviceName) => {
                me.lock(task, (task) => {
                    me.log("loading service: " + serviceName + "...");
                    me.include("service." + serviceName, function () {
                        me.log("service loaded: " + serviceName);
                        me.log("setup service: " + serviceName + "...");
                        me.core.message.send("service." + serviceName + ".setup", () => {
                            me.log("setup service: " + serviceName + " complete");
                            me.unlock(task);
                        }, ref);
                    });
                });
            });
            me.unlock(task, () => {
                callback(me.serviceNames, ref);
            });
        });
    };
    me.config = function (callback, name) {
        me.core.util.config(callback, "settings.service." + name);
    };
    me.sendAll = function (method, callback, param) {
        if (me.platform === "service") {
            var args = Array.prototype.slice.call(arguments);
            me.serviceNames.map((serviceName) => {
                args[0] = "service." + serviceName + "." + method;
                me.core.message.send.apply(null, args);
            });
        }
        else {
            var errors = null;
            var args = Array.prototype.slice.call(arguments);
            var count = 0;
            var responses = [];
            args[1] = function () {
                var response = Array.prototype.slice.call(arguments);
                responses.push(response);
                count--;
                me.log("recieved from a device, " + count + " devices left" + "responses: " + JSON.stringify(responses));
                if (!count) {
                    callback.apply(null, responses);
                }
            };
            if (me.clients) {
                me.clients.forEach((info, socket) => {
                    me.core.message.send_service.apply(socket, args);
                    count++;
                });
            }
            else {
                callback();
            }
            me.log("sent " + method + "' to " + count + " devices");
        }
    };
    me.ready = {
        set: function (socket) {

        }
    };
};
