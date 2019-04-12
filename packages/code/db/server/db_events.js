/*
 @author Zakai Hamilton
 @component DbEvents
 */

screens.db.events = function DbEvents(me, packages) {
    return "server";
};

screens.db.events.participants = function DbEventsParticipants(me, packages) {
    const { storage } = packages;
    me.init = () => storage.db.extension(me);
    me.cache = {};
    me.options = { capped: true, size: 242880, max: 250 };
    return "server";
};

screens.db.events.msg = function DbEventsParticipants(me, packages) {
    const { core, storage } = packages;
    me.lastMsgId = 0;
    me.busy = false;
    me.init = async () => {
        storage.db.extension(me);
        setInterval(me.handleNextMsg, 10000);
    };
    me.options = { capped: true, size: 32000, max: 100 };
    me.handleNextMsg = async function () {
        if (!me.storage.db.supported()) {
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
                me.log("running message: " + index + " - " + item.date + " - " + JSON.stringify(item.args));
                try {
                    await core.message.send.apply(null, item.args);
                }
                catch (err) {
                    me.log_error("Cannot handle message" + JSON.stringify(item.args) + " err:" + err);
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
    me.send = function (method) {
        var args = Array.prototype.slice.call(arguments, 0);
        me.push({ date: new Date().toString(), args });
    };
    return "server";
};