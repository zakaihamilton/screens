/*
    @author Zakai Hamilton
    @component CoreNode
*/

package.core.node = function CoreNode(me) {
    me.test = function() {
        return "Test";
    };
    me.print = function(text) {
        me.core.console.log(text);
    };
};
