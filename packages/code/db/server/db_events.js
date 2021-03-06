/*
 @author Zakai Hamilton
 @component DbEvents
 */

screens.db.events = function DbEvents() {
    return "server";
};

screens.db.events.participants = function DbEventsParticipants(me, { storage }) {
    me.init = () => storage.db.extension(me);
    me.options = { capped: true, size: 242880, max: 250 };
    return "server";
};

screens.db.events.logs = function DbEventsLogs(me, { storage }) {
    me.init = () => storage.db.extension(me);
    me.options = { capped: true, size: 242880, max: 250 };
    return "server";
};

screens.db.events.servers = function DbEventsServers(me, { core, storage }) {
    me.init = async () => {
        storage.db.extension(me);
        core.broadcast.register(me, {
            startup: "db.events.servers.register",
            shutdown: "db.events.servers.unregister"
        });
    };
    me.register = async function () {
        if (!core.http.localhost) {
            let ip = await core.server.ip();
            me.use({ ip }, { date: new Date().toString() });
        }
    };
    me.unregister = async function () {
        if (!core.http.localhost) {
            let ip = await core.server.ip();
            me.remove({ ip });
        }
    };
    return "server";
};

screens.db.events.state = function DbEventsState(me, { core, storage }) {
    me.init = async () => {
        storage.db.extension(me);
    };
    me.set = async function (component, path, step, properties) {
        let ip = await core.server.ip();
        let date = new Date().toString();
        if (!properties) {
            properties = {};
        }
        if (step) {
            properties = Object.assign({}, properties, {
                date,
                step
            });
            me.use({ ip, component, path }, properties);
        }
        else {
            me.remove({ ip, component, path });
        }
    };
    return "server";
};

screens.db.events.msg = function DbEventsMsg(me, { core, storage, db }) {
    me.lastMsgId = 0;
    me.busy = false;
    me.init = async () => {
        storage.db.extension(me);
        setInterval(me.handleNextMsg, 10000);
    };
    me.options = { capped: true, size: 128000, max: 1000 };
    me.handleNextMsg = async function () {
        let ip = await core.server.ip();
        if (!storage.db.supported()) {
            return;
        }
        if (me.busy) {
            return;
        }
        me.busy = true;
        try {
            var list = await me.list();
            if (!list) {
                return;
            }
            if (!list.length) {
                return;
            }
            var index = list.findIndex((item) => item._id === me.lastMsgId);
            if (index == -1) {
                me.lastMsgId = list[list.length - 1]._id;
                return;
            }
            for (index++; index < list.length; index++) {
                var item = list[index];
                if (!item.ip || item.ip === ip) {
                    me.log("running message: " + index + " - " + item.date + " - " + JSON.stringify(item.args));
                    try {
                        await core.message.send.apply(null, item.args);
                    }
                    catch (err) {
                        me.log_error("Cannot handle message" + JSON.stringify(item.args) + " err:" + err);
                    }
                }
                me.lastMsgId = item._id;
            }
        }
        catch (err) {
            me.log_error("Cannot handle messages : " + err);
        }
        finally {
            me.busy = false;
        }
    };
    me.send = function (method, ...params) {
        me.push({ date: new Date().toString(), args: [method, ...params] });
    };
    me.sendTo = function (ip, method, ...params) {
        me.push({ date: new Date().toString(), args: [method, ...params], ip });
    };
    me.sendParallel = async function (array) {
        var servers = await db.events.servers.list({});
        var ipList = servers.map(server => server.ip).filter(Boolean);
        var ipCounter = {};
        var ip = null;
        let results = [];
        for (let args of array) {
            let ipIndex = ipList.indexOf(ip);
            ip = (ipIndex < ipList.length - 1) ? ipList[ipIndex + 1] : ipList[0];
            results.push({ date: new Date().toString(), args, ip });
            if (!ipCounter[ip]) {
                ipCounter[ip] = 0;
            }
            ipCounter[ip]++;
        }
        me.log("Sent to " + ipList.length + " servers with " + array.length + " messages" + " distribution: " + JSON.stringify(ipCounter));
        for (let result of results) {
            await me.push(result);
        }
    };
    return "server";
};