/*
 @author Zakai Hamilton
 @component CoreRemote
 */

package.core.remote = new function() {
    this.remote = true;
    this.test = function(param1, param2, param3) {
        var result = "test: param1=" + param1 + " param2=" + param2 + " param3=" + param3;
        console.log(result);
        return result;
    };
};
