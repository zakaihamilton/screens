/*
 @author Zakai Hamilton
 @component CoreConsole
 */

package.core.console = function CoreConsole(me) {
    me.messages = [];
    me.clear = function() {
        me.messages = [];
    };
    me.log = function(message) {
        var date = new Date();
        var fullMessage = date.toUTCString() + " log [" + me.platform + "] " + message;
        me.messages.push(fullMessage);
        console.log(fullMessage);
    };
    me.error = function(message) {
        if(message) {
            var date = new Date();
            var fullMessage = date.toUTCString() + " error [" + me.platform + "] " + message;
            me.messages.push(fullMessage);
            console.error(fullMessage);
        }
    };
    me.retrieveMessages = function(callback) {
        callback(me.messages);
    };
    me.clearMessages = function(callback) {
        me.clear();
        callback();
    };
};
