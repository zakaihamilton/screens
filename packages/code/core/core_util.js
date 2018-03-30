/*
 @author Zakai Hamilton
 @component CoreUtil
 */

screens.core.util = function CoreUtil(me) {
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
    me.config = function(callback, path) {
        me.core.json.loadFile(function(item) {
            if(item && path) {
                item = me.core.json.traverse(item, path).value;
            }
            callback(item);
        }, "/package.json");
    };
    me.isSecure = function() {
        return location.protocol === 'https:';
    };
    me.restart = function() {
        location.reload(true);
    }
};
