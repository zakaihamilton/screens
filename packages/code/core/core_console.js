/*
 @author Zakai Hamilton
 @component CoreConsole
 */

screens.core.console = function CoreConsole(me) {
    me.messages = [];
    me.enabled = true;
    me.fixedSize = 500;
    me.clear = function() {
        me.messages = [];
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
    me.push = function(message) {
        if(me.messages.length > me.itemCount) {
            me.messages.splice(0, me.messages.length - me.message.fixedSize);
        }
        me.messages.push(message);
    };
    me.log = function(message) {
        if(me.enabled) {
            var date = new Date();
            var fullMessage = date.toUTCString() + " log [" + me.platform + (this.id ? " - " + this.id : "") + "] " + message;
            me.push(fullMessage);
            console.log(fullMessage);
        }
    };
    me.log_warn = function(message) {
        if(me.enabled) {
            var date = new Date();
            var fullMessage = date.toUTCString() + " warn [" + me.platform + (this.id ? " - " + this.id : "") + "] " + message;
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
                var date = new Date();
                var fullMessage = date.toUTCString() + " error [" + me.platform + (this.id ? " - " + this.id : "") + "] " + message + " stack: " + stack;
                me.push(fullMessage);
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
    me.clearMessages = function() {
        me.clear();
    };
};
