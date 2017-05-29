/*
 @author Zakai Hamilton
 @component CoreRemote
 */

package.core.remote = new function() {
    this.remote = true;
    this.test = function(param1, param2, param3) {
        var result = "test: param1=" + param1 + " param2=" + param2 + " param3=" + param3 + " " + package.core.platform;
        return result;
    };
    this.return_number = function(number) {
        return number + 500;
    };
    this.return_string = function(string) {
        return string + "abc";
    };
    this.return_map = function(map) {
        map["update"] = 500;
        return map;
    };
    this.return_array = function(array) {
        array.push("new entry");
        return array;
    };
};
