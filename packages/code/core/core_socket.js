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
                        me.log(`Socket disconnected [id=${socket.id} platform=${info.platform} ref=${info.ref}]`);
                    }
                });
                socket.on('heartbeat_response', (data) => {
                    var info = me.sockets.get(socket);
                    if (info) {
                        me.log(`heartbeat received [id=${socket.id} platform=${info.platform} ref=${info.ref}]`);
                    }
                });
                me.register(socket);
                var info = await me.core.message.send_service.call(socket, "core.socket.setup", ref);
                me.sockets.set(socket, info);
                me.core.object(me, socket);
                me.core.property.set(socket, "ready");
                me.log("Socket ready for ref: " + ref +
                    " platform: " + info.platform +
                    ", sockets size: " + me.sockets.size);
            });
            me.sendHeartbeat();
        } else if (me.platform === "service") {
            me.client = require("socket.io-client");
            if (process.argv.length < 3) {
                me.log("params: http://ip:port");
                process.exit(-1);
            }
            me.serverAddress = process.argv[2];
            me.log("Connecting to server: " + me.serverAddress);
            me.io = me.client.connect(me.serverAddress);
            me.register(me.io);
            return new Promise((resolve, reject) => {
                me.io.on("connect", () => {
                    me.log("Connected to server: " + me.serverAddress);
                    me.io.on("disconnect", (info) => {
                        me.log("Disconnected from server: " + me.serverAddress);
                    });
                    resolve();
                });
            });
        }
        else if (me.platform === "browser") {
            var io = await me.core.require("/node_modules/socket.io-client/dist/socket.io.js");
            me.io = io();
            me.register(me.io);
        }
    };
    me.sendHeartbeat = function () {
        setTimeout(me.sendHeartbeat, 16000);
        me.io.emit('heartbeat_send', { beat: 1 });
    };
    me.setup = async function (ref) {
        me.ref = ref;
        return { platform: me.platform, ref };
    };
    me.send = async function (socket, name, info) {
        return new Promise((resolve, reject) => {
            var responseCallback = (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            };
            var args = Array.prototype.slice.call(arguments, 1);
            info = Object.assign({}, info);
            info.platform = me.platform;
            info.callback = me.core.handle.push(responseCallback);
            try {
                socket.emit(name, info);
            }
            catch (err) {
                throw "socket emit failed: " + JSON.stringify(info) + " error: " + err;
            }
        });
    };
    me.register = function (socket) {
        socket.on("send", async (info) => {
            if (socket.request && socket.request.connection) {
                info.clientIp = socket.request.connection.remoteAddress;
            }
            me.core.object(me, info);
            info.socket = socket;
            var args = null;
            try {
                await me.core.property.set(info, "verify");
                await me.core.property.set(info, "access");
            }
            catch (err) {
                me.log("failed check args: " + JSON.stringify(info.args) + " error: " + err.toString() + " stack: " + err.stack);
                args = [err];
            }
            if (!args) {
                try {
                    me.core.message.prepareArgs(info);
                    args = await me.core.message.handleLocal(info, info.args);
                    me.core.message.releaseArgs(info);
                }
                catch (err) {
                    me.log("args: " + JSON.stringify(info.args) + " error: " + err.toString() + " stack: " + err.stack);
                    args = [err];
                }
            }
            if (args) {
                info.socket = null;
                info.args = args;
                info.platform = me.platform;
                socket.emit("receive", info);
            }
        });
        socket.on("notify", async (info) => {
            var callback = me.core.handle.find(info.callback);
            if (callback) {
                callback.apply(null, info.args);
            }
        });
        socket.on("receive", async (info) => {
            var callback = me.core.handle.pop(info.callback);
            if (callback) {
                callback.apply(null, info.args);
            }
        });
        socket.on("heartbeat_send", (data) => {
            socket.emit('heartbeat_response', { beat: 1 });
            me.log("heartbeat response sent");
        });        
    };
    me.list = function (platform) {
        var items = [];
        if (me.sockets) {
            me.sockets.forEach((info, socket) => {
                if (!platform || info.platform === platform) {
                    items.push(info);
                }
            });
        }
        return items;
    };
    me.sendFirst = async function (platform, method, param) {
        var promise = null;
        var args = Array.prototype.slice.call(arguments, 1);
        var count = 0;
        if (me.sockets) {
            me.log("number of sockets: " + me.sockets.size);
            me.sockets.forEach((info, socket) => {
                if (count) {
                    return;
                }
                me.log("socket platform: " + info.platform + " ref: " + info.ref);
                if (!platform || info.platform === platform) {
                    me.log("sending to ref: " + info.ref + " platform: " + info.platform + " match: " + platform);
                    promise = me.core.message.send_socket.apply(socket, args);
                    count++;
                }
            });
        }
        me.log("sent " + method + "' to " + count + " devices");
        var response = await promise;
        return response;
    };
    me.sendAll = async function (platform, method, param) {
        var promises = [];
        var args = Array.prototype.slice.call(arguments, 1);
        var count = 0;
        if (me.sockets) {
            me.sockets.forEach((info, socket) => {
                if (!platform || info.platform === platform) {
                    me.log("sending to ref: " + info.ref + " platform: " + info.platform + " match: " + platform);
                    var promise = me.core.message.send_socket.apply(socket, args);
                    promises.push(promise);
                    count++;
                }
            });
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
