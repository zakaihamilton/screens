/*
 @author Zakai Hamilton
 @component CoreRemote
 */

package.require("core.remote", "server");

package.core.remote = function CoreRemote(me) {
    me.test = function(param1, param2, param3) {
        var result = "test: param1=" + param1 + " param2=" + param2 + " param3=" + param3 + " " + me.platform;
        package.core.console.log("result: " + result);
        return result;
    };
    me.return_number = function(number) {
        return number + 500;
    };
    me.return_string = function(string) {
        return string + "abc";
    };
    me.return_map = function(map) {
        map["update"] = 500;
        return map;
    };
    me.return_array = function(array) {
        array.push("new entry");
        return array;
    };
};
