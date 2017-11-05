/*
 @author Zakai Hamilton
 @component CoreConsole
 */

package.core.console = function CoreConsole(me) {
    me.log = function(message) {
        console.log(me.the.platform + ": " + message);
    };
};
