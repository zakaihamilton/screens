/*
 @author Zakai Hamilton
 @component CoreConsole
 */

package.core.console = function CoreConsole(me) {
    me.messages = [];
    me.enabled = true;
    me.clear = function() {
        me.messages = [];
    };
    me.init = function() {
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
            var fullMessage = date.toUTCString() + " log [" + me.platform + "] " + message;
            me.messages.push(fullMessage);
            console.log(fullMessage);
        }
    };
    me.warn = function(message) {
        if(me.enabled) {
            var date = new Date();
            var fullMessage = date.toUTCString() + " warn [" + me.platform + "] " + message;
            me.messages.push(fullMessage);
            console.warn(fullMessage);
        }
    };
    me.error = function(message) {
        if(me.enabled) {
            if(message) {
                var date = new Date();
                var fullMessage = date.toUTCString() + " error [" + me.platform + "] " + message;
                me.messages.push(fullMessage);
                console.error(fullMessage);
            }
        }
    };
    me.isEnabled = function(callback) {
        callback(me.enabled);
    };
    me.enable = function(callback, flag) {
        me.enabled = flag;
        callback();
    };
    me.retrieveMessages = function(callback) {
        callback(me.messages);
    };
    me.clearMessages = function(callback) {
        me.clear();
        callback();
    };
};
