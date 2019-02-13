/*
 @author Zakai Hamilton
 @component DbEvents
 */

screens.db.events = function DbEvents(me) {
    return "server";
};

screens.db.events.participants = function DbEventsParticipants(me) {
    me.init = () => me.storage.db.extension(me);
    me.options = { capped: true, size: 5242880, max: 5000 };
    return "server";
};

screens.db.events.msg = function DbEventsParticipants(me) {
    me.lastMsgId = 0;
    me.busy = false;
    me.init = async () => {
        me.storage.db.extension(me);
        setInterval(me.handleNextMsg, 5000);
    };
    me.options = { capped: true, size: 64000, max: 500 };
    me.handleNextMsg = async function () {
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
                me.log("running message: " + JSON.stringify(item.args));
                await me.core.message.send.apply(null, item.args);
                me.lastMsgId = item._id;
            }
        }
        finally {
            me.busy = false;
        }
    };
    me.send = function (method) {
        var args = Array.prototype.slice.call(arguments, 0);
        me.push({ args });
    };
    return "server";
};