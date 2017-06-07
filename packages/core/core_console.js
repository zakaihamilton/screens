/*
 @author Zakai Hamilton
 @component CoreConsole
 */

package.core.console = new function CoreConsole() {
    var me = this;
    me.log = function(message) {
        console.log(package.core.platform + ": " + message);
    };
}
