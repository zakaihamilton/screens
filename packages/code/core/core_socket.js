/*
 @author Zakai Hamilton
 @component CoreSocket
 */

screens.core.socket = function CoreSocket(me, { core }) {
    me.init = () => {
        if (screens.platform === "server") {
            core.broadcast.register(me, {
                httpReady: "core.socket.httpReady"
            });
        }
        else if (screens.platform === "browser") {
            // eslint-disable-next-line no-undef
            me.io = io();
        }
    };
    me.ready = () => {
        me.io.emit("ready");
    };
    me.send = async (info) => {
        const headers = await core.http.prepare(info);
        if (screens.platform === "server") {
            return core.interface.handle({ ...info, headers });
        }
        else if (screens.platform === "browser") {
            return new Promise((resolve, reject) => {
                try {
                    me.io.emit("message", { ...info, headers }, response => {
                        resolve(response);
                    });
                }
                catch (err) {
                    reject(err);
                }
            });
        }
    };
    me.httpReady = () => {
        const io = core.http.io;
        io.on("connection", socket => {
            // eslint-disable-next-line no-console
            console.log("a user connected");
            socket.on("event", data => {
                // eslint-disable-next-line no-console
                console.log("user event", data);
            });
            socket.on("message", async (info, callback) => {
                const result = await core.interface.handle(info);
                callback(result);
            });
            socket.on("ready", data => {
                // eslint-disable-next-line no-console
                console.log("user ready", data);
            });
            socket.on("disconnect", () => {
                // eslint-disable-next-line no-console
                console.log("user disconnected");
            });
        });
    };
};
