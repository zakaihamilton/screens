/*
 @author Zakai Hamilton
 @component CoreConsole
 */

screens.core.console = function CoreConsole(me) {
    me.messages = [];
    me.errors = [];
    me.enabled = true;
    me.fixedSize = 5000;
    me.clear = function() {
        me.messages = [];
        me.errors = [];
    };
    me.init = function() {
        screens.log = me.log;
        screens.log_error = me.log_error;
        screens.warn = me.log_warn;
        if(me.platform === "browser") {
            me.enabled = !me.core.util.isSecure();
        }
        else {
            me.enabled = true;
        }
    };
    me.formatMessage = function(id, message) {
        var date = new Date();
        var formattedMessage = date.toUTCString() + " log [" + me.platform + (this.id ? " - " + this.id : "") + "] " + message;
        return formattedMessage;
    };
    me.push = function(message) {
        if(me.messages.length > me.fixedSize) {
            me.messages.shift();
        }
        me.messages.push(message);
    };
    me.log = function(message) {
        if(me.enabled) {
            var fullMessage = me.formatMessage(this.id, message);
            me.push(fullMessage);
            console.log(fullMessage);
        }
    };
    me.log_warn = function(message) {
        if(me.enabled) {
            var fullMessage = me.formatMessage(this.id, message);
            me.push(fullMessage);
            console.warn(fullMessage);
        }
    };
    me.log_error = function(message, stack) {
        if(me.enabled) {
            if(message) {
                if(!stack) {
                    stack = new Error().stack;
                }
                var fullMessage = me.formatMessage(this.id, message + " stack: " + stack);
                me.push(fullMessage);
                me.errors.push(fullMessage);
                console.error(fullMessage);
            }
        }
    };
    me.isEnabled = function() {
        return me.enabled;
    };
    me.enable = function(flag) {
        me.enabled = flag;
    };
    me.retrieveMessages = function() {
        return me.messages;
    };
    me.retrieveErrors = function() {
        return me.errors;
    };
    me.clearMessages = function() {
        me.clear();
    };
};
