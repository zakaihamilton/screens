/*
 @author Zakai Hamilton
 @component CoreSocket
 */

screens.core.socket = function CoreSocket(me, { core }) {
    me.init = async function () {
        if (me.platform === "server") {
            me.sockets = new Map();
            me.io = core.http.io;
            if (!me.io) {
                me.log("Cannot connect to socket io because it is null");
                return;
            }
            me.io.on("connection", async (socket) => {
                me.log(`Socket connected [id=${socket.id}]`);
                var ref = core.ref.gen();
                socket.on("disconnect", () => {
                    var info = me.sockets.get(socket);
                    if (info) {
                        me.sockets.delete(socket);
                        me.log(`Socket disconnected [id=${socket.id} platform=${info.platform} ref=${info.ref}]`);
                    }
                });
                me.register(socket);
                var info = await core.message.send_service.call(socket, "core.socket.setup", ref);
                me.sockets.set(socket, info);
                core.property.object.create(me, socket);
                core.property.set(socket, "ready");
                me.log("Socket ready for ref: " + ref +
                    " platform: " + info.platform +
                    ", sockets size: " + me.sockets.size);
            });
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
            var firstTime = true;
            return new Promise((resolve) => {
                me.io.on("connect", () => {
                    me.log("Connected to server: " + me.serverAddress);
                    me.isConnected = true;
                    if (firstTime) {
                        firstTime = false;
                        resolve();
                    }
                });
                me.io.on("disconnect", () => {
                    me.isConnected = false;
                    me.log("Disconnected from server: " + me.serverAddress);
                });
            });
        }
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
            info = Object.assign({}, info);
            info.platform = me.platform;
            info.callback = core.handle.push(responseCallback);
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
            core.property.object.create(me, info);
            info.socket = socket;
            var args = null;
            try {
                await core.property.set(info, "verify");
                await core.property.set(info, "access");
            }
            catch (err) {
                me.log("failed check args: " + JSON.stringify(info.args) + " error: " + err.toString() + " stack: " + err.stack);
                args = [err];
            }
            if (!args) {
                await core.util.performance(info.args[0], async () => {
                    try {
                        core.message.prepareArgs(info);
                        args = await core.message.handleLocal(info, info.args);
                        core.message.releaseArgs(info);
                    }
                    catch (err) {
                        me.log("args: " + JSON.stringify(info.args) + " error: " + err.toString() + " stack: " + err.stack);
                        args = [err];
                    }
                });
            }
            if (args) {
                info.socket = null;
                info.args = args;
                info.platform = me.platform;
                socket.emit("receive", info);
            }
        });
        socket.on("notify", async (info) => {
            var callback = core.handle.find(info.callback);
            if (callback) {
                callback.apply(null, info.args);
            }
        });
        socket.on("receive", async (info) => {
            var callback = core.handle.pop(info.callback);
            if (callback) {
                callback.apply(null, info.args);
            }
        });
    };
    me.list = function (platform) {
        var items = [];
        if (me.sockets) {
            me.sockets.forEach((info) => {
                if (!platform || info.platform === platform) {
                    items.push(info);
                }
            });
        }
        return items;
    };
    me.sendFirst = async function (platform, method, ...params) {
        var promise = null;
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
                    promise = core.message.send_socket.call(socket, method, ...params);
                    count++;
                }
            });
        }
        me.log("sent " + method + "' to " + count + " devices");
        var response = await promise;
        return response;
    };
    me.sendAll = async function (platform, method, ...params) {
        var promises = [];
        var count = 0;
        if (me.sockets) {
            me.sockets.forEach((info, socket) => {
                if (!platform || info.platform === platform) {
                    me.log("sending to ref: " + info.ref + " platform: " + info.platform + " match: " + platform);
                    var promise = core.message.send_socket.call(socket, method, ...params);
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
        set: function () {

        }
    };
};
