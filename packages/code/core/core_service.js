/*
 @author Zakai Hamilton
 @component CoreService
 */

package.core.service = function CoreService(me) {
    me.init = function () {
        if (me.platform === "server") {
            me.core.util.config(config => {
                if (config.servicePort) {
                    me.io = require("socket.io");
                    me.server = me.io.listen(config.servicePort);
                    me.clients = new Map();
                    me.server.on("connection", (socket) => {
                        console.info(`Service connected [id=${socket.id}]`);
                        var ref = me.core.ref.gen();
                        me.clients.set(socket, ref);
                        socket.on("disconnect", () => {
                            me.clients.delete(socket);
                            console.info(`Service disconnected [id=${socket.id}]`);
                        });
                        socket.on("method", (info) => {
                            me.core.message.handleLocal((response) => {
                                socket.emit("method", response);
                            }, info);
                        });
                        console.log("Service setup request for ref: " + ref);
                        me.core.message.send_service.call(socket, "core.service.setup", () => {
                            console.log("Service setup complete for ref: " + ref);
                        }, ref);
                    });
                }
            });
        } else if (me.platform === "service") {
            me.io = require("socket.io-client");
            if (process.argv.length <= 3) {
                console.log("params: service_name http://ip:port");
                process.exit(-1);
            }
            me.serviceName = process.argv[2];
            me.serverAddress = process.argv[3];
            me.client = me.io.connect(me.serverAddress);
            me.client.on("method", (info) => {
                me.core.message.handleLocal((response) => {
                    me.client.emit("method", response);
                }, info);
            });
        }
    };
    me.setup = function (callback, ref) {
        package.include("service." + me.serviceName, function (info) {
            if (info.complete) {
                callback(ref);
            }
        });
    };
};
