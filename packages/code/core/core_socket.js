/*
 @author Zakai Hamilton
 @component CoreSocket
 */

screens.core.socket = function CoreSocket(me) {
    me.init = async function () {
        if (me.platform === "server") {
            me.sockets = new Map();
            me.io = me.core.http.io;
            me.io.on("connection", async (socket) => {
                me.log(`Socket connected [id=${socket.id}]`);
                var ref = me.core.ref.gen();
                socket.on("disconnect", () => {
                    var info = me.sockets.get(socket);
                    if (info) {
                        me.sockets.delete(socket);
                        me.log(`Socket disconnected [id=${socket.id} name=${info.name} ref=${info.ref}]`);
                    }
                });
                me.register(socket);
                var info = await me.core.message.send_service.call(socket, "core.socket.setup", ref);
                me.sockets.set(socket, info);
                me.core.object(me, socket);
                me.core.property.set(socket, "ready");
                me.log("Socket ready for ref: " + ref);
            });
        } else if (me.platform === "service") {
            me.io = require("socket.io-client");
            if (process.argv.length < 3) {
                me.log("params: http://ip:port");
                process.exit(-1);
            }
            me.serverAddress = process.argv[2];
            me.log("Connecting to server: " + me.serverAddress);
            me.io = me.io.connect(me.serverAddress);
            me.io.on("connect", () => {
                me.log("Connected to server: " + me.serverAddress);
                me.io.on("disconnect", (info) => {
                    me.log("Disconnected from server: " + me.serverAddress);
                });
                me.register(me.io);
            });
        }
        else if (me.platform === "browser") {
            var io = await me.core.require("/node_modules/socket.io-client/dist/socket.io.js");
            me.io = io();
            me.register(me.io);
        }
    };
    me.setup = async function (ref) {
        return {platform:me.platform,name:me.serviceNames};
    };
    me.register = function (socket) {
        socket.on("send", async (info) => {
            if(socket.request && socket.request.connection) {
                info.clientIp = socket.request.connection.remoteAddress;
            }
            me.core.object(me, info);
            await me.core.property.set(info, "check");
            info.socket = socket;
            me.core.message.prepareArgs(info);
            var args = await me.core.message.handleLocal(info, info.args);
            me.core.message.releaseArgs(info);
            if (args) {
                info.socket = null;
                info.args = args;
                socket.emit("receive", info);
            }
        });
        socket.on("notify", async (info) => {
            var callback = me.core.handle.find(info.callback);
            callback.apply(null, info.args);
        });
        socket.on("receive", async (info) => {
            var callback = me.core.handle.pop(info.callback);
            callback.apply(null, info.args);
        });
    };
    me.list = function (platform) {
        var items = [];
        if (me.sockets) {
            me.sockets.forEach((info, socket) => {
                if(!platform || info.platform === platform) {
                    items.push(info);
                }
            });
        }
        return items;
    };
    me.sendAll = async function (platform, method, param) {
        var promises = [];
        var errors = null;
        var args = Array.prototype.slice.call(arguments);
        var count = 0;
        if (me.sockets) {
            for (var socket in me.sockets) {
                var info = me.sockets[socket];
                if(!platform || info.platform === platform) {
                    var promise = me.core.message.send_socket.apply(socket, args);
                    promises.push(promise);
                }
            }
        }
        me.log("sent " + method + "' to " + count + " devices");
        var responses = Promise.all(promises);
        return responses;
    };
    me.ready = {
        set: function (socket) {

        }
    };
};
