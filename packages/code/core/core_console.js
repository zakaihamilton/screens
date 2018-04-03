/*
 @author Zakai Hamilton
 @component CoreConsole
 */

screens.core.console = function CoreConsole(me) {
    me.messages = [];
    me.enabled = true;
    me.clear = function() {
        me.messages = [];
    };
    me.init = function() {
        screens.log = me.log;
        screens.error = me.error;
        screens.warn = me.warn;
        if(me.platform === "browser") {
            me.enabled = !me.core.util.isSecure();
        }
        else {
            me.enabled = true;
        }
    };
    me.log = function(message) {
        if(me.enabled) {
            var date = new Date();
            var fullMessage = date.toUTCString() + " log [" + me.platform + (this.id ? " - " + this.id : "") + "] " + message;
            me.messages.push(fullMessage);
            console.log(fullMessage);
        }
    };
    me.warn = function(message) {
        if(me.enabled) {
            var date = new Date();
            var fullMessage = date.toUTCString() + " warn [" + me.platform + (this.id ? " - " + this.id : "") + "] " + message;
            me.messages.push(fullMessage);
            console.warn(fullMessage);
        }
    };
    me.error = function(message, stack) {
        if(me.enabled) {
            if(message) {
                if(!stack) {
                    stack = new Error().stack;
                }
                var date = new Date();
                var fullMessage = date.toUTCString() + " error [" + me.platform + (this.id ? " - " + this.id : "") + "] " + message + " stack: " + stack;
                me.messages.push(fullMessage);
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
