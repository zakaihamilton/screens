/*
    @author Zakai Hamilton
    @component CoreNode
*/

package.core.node = new function CoreNode() {
    var core = package.core;
    this.test = function() {
        return "Test";
    };
    this.print = function(text) {
        core.console.log(text);
    };
};
