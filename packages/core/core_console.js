/*
 @author Zakai Hamilton
 @component CoreEvent
 */

package.core.console = new function CoreEvent() {
    this.log = function(message) {
        console.log(package.core.platform + ": " + message);
    };
}
