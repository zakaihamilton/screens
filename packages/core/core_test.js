/*
 @author Zakai Hamilton
 @component CoreTest
 */

package.require("core.test", "server");

package.core.test = function CoreTest(me) {
    me.test = function(callback, param1, param2, param3) {
        var result = "test: param1=" + param1 + " param2=" + param2 + " param3=" + param3 + " " + me.platform;
        if(callback) {
            callback(result);
        }
    };
    me.return_number = function(callback, number) {
        var result = number + 500;
        if(callback) {
            callback(result);
        }
    };
    me.return_string = function(callback, string) {
        string += "abc";
        if(callback) {
            callback(string);
        }
    };
    me.return_map = function(callback, map) {
        map["update"] = 500;
        if(callback) {
            callback(map);
        }
    };
    me.return_array = function(callback, array) {
        array.push("new entry");
        if(callback) {
            callback(array);
        }
    };
};
