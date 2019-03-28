/*
 @author Zakai Hamilton
 @component CoreConsole
 */

screens.core.console = function CoreConsole(me, packages) {
    const { core } = packages;
    me.messages = [];
    me.errors = [];
    me.enabled = true;
    me.fixedSize = 5000;
    me.clear = function () {
        me.messages = [];
        me.errors = [];
    };
    me.init = function () {
        if (me.platform === "browser" || me.platform === "service_worker") {
            me.enabled = !core.util.isSecure();
        }
        else {
            me.enabled = true;
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
                me.errors.push(fullMessage);
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
    me.retrieveMessages = function () {
        return me.messages;
    };
    me.retrieveErrors = function () {
        return me.errors;
    };
    me.clearMessages = function () {
        me.clear();
    };
};
