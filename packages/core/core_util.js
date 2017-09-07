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
};
