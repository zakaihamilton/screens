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
        var fullMessage = date.toUTCString() + " [" + me.package.platform + "] " + message;
        me.messages.push(fullMessage);
        console.log(fullMessage);
    };
    me.retrieveMessages = function(callback) {
        callback(me.messages);
    };
    me.clearMessages = function(callback) {
        me.clear();
        callback();
    };
};
