/*
    @author Zakai Hamilton
    @component CoreNode
*/

package.core.node = new function CoreNode() {
    this.remote = true;
    this.test = function() {
        return "Test";
    };
    this.print = function(text) {
        console.log(text);
    };
};
