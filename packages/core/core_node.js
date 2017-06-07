/*
    @author Zakai Hamilton
    @component CoreNode
*/

package.core.node = new function CoreNode() {
    var me = this;
    var core = package.core;
    me.test = function() {
        return "Test";
    };
    me.print = function(text) {
        core.console.log(text);
    };
};
