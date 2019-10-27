/*
 @author Zakai Hamilton
 @component CoreConsole
 */

screens.core.console = function CoreConsole(me, { core, db, storage }) {
    me.messages = [];
    me.enabled = true;
    me.fixedSize = 5000;
    me.clear = function () {
        me.messages = [];
        if (me.platform === "server") {
            db.events.logs.remove({}, false);
        }
    };
    me.init = async function () {
        if (me.platform === "browser" || me.platform === "service_worker") {
            me.enabled = !core.util.isSecure();
        }
        else {
            me.enabled = true;
        }
        if (me.platform === "server") {
            me.ip = await core.server.ip();
        }
    };
    me.formatMessage = function (componentId, userName, message) {
        var date = new Date();
        var formattedMessage = date.toUTCString() + " log [" + me.platform;
        if (userName) {
            formattedMessage += " - " + userName;
        }
        if (componentId) {
            formattedMessage += " - " + componentId;
        }
        formattedMessage += "] " + message;
        return formattedMessage;
    };
    me.push = function (message) {
        if (me.messages.length > me.fixedSize) {
            me.messages.shift();
        }
        me.messages.push(message);
        if (me.platform === "server" && storage.db.clusterHandle) {
            db.events.logs.push({ ip: me.ip, message });
        }
    };
    me.log = function (message, componentId, userName) {
        if (me.enabled) {
            if (!componentId) {
                componentId = this.id;
            }
            if (!userName) {
                userName = this.userName;
            }
            var fullMessage = me.formatMessage(componentId, userName, message);
            me.push(fullMessage);
            console.log(fullMessage);
        }
    };
    me.log_warn = function (message, componentId, userName) {
        if (me.enabled) {
            if (!componentId) {
                componentId = this.id;
            }
            if (!userName) {
                userName = this.userName;
            }
            var fullMessage = me.formatMessage(componentId, userName, message);
            me.push(fullMessage);
            console.warn(fullMessage);
        }
    };
    me.log_error = function (message, stack, componentId, userName) {
        if (me.enabled) {
            if (message) {
                if (!stack) {
                    stack = new Error().stack;
                }
                if (!componentId) {
                    componentId = this.id;
                }
                if (!userName) {
                    userName = this.userName;
                }
                var fullMessage = me.formatMessage(componentId,
                    userName,
                    message + " stack: " + stack);
                me.push(fullMessage);
                console.error(fullMessage);
            }
        }
    };
    me.isEnabled = function () {
        return me.enabled;
    };
    me.enable = function (flag) {
        me.enabled = flag;
    };
    me.retrieveMessages = async function () {
        if (me.platform === "server") {
            let list = await db.events.logs.list();
            list = list.map(obj => obj.ip + " - " + obj.message);
            return list;
        }
        else {
            return me.messages;
        }
    };
    me.clearMessages = function () {
        me.clear();
    };
};
