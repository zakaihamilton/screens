/*
 @author Zakai Hamilton
 @component CoreUtil
 */

package.core.util = function CoreUtil(me) {
    me.removeLast = function (string, separator) {
        var array = string.split(separator);
        array.pop();
        return array.join(separator);
    };
    me.getArgs = function (func) {
        // First match everything inside the function argument parens.
        var args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];

        // Split the arguments string into an array comma delimited.
        return args.split(',').map(function (arg) {
            // Ensure no inline comments are parsed and trim the whitespace.
            return arg.replace(/\/\*.*\*\//, '').trim();
        }).filter(function (arg) {
            // Ensure no undefined values are added.
            return arg;
        });
    };
    me.config = function(callback) {
        me.core.json.loadFile(function(json) {
            if(json) {
                callback(json);
            }
            else {
                callback(null);
            }
        }, "/package.json");
    };
};
