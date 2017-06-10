/*
    @author Zakai Hamilton
    @component CoreNode
*/

package.core.node = function CoreNode(me) {
    var core = package.core;
    me.test = function() {
        return "Test";
    };
    me.print = function(text) {
        core.console.log(text);
    };
};
