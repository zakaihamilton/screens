/*
 @author Zakai Hamilton
 @component CoreNumber
 */

package.core.number = function CoreNumber(me) {
    me.fillArray = {
        get: function(object, range) {
            var result = [];
            range = range.split("-");
            if(range.length > 1) {
                for(var index = range[0]; index <= range[1]; index++) {
                    result.push([index]);
                }
            }
            return result;
        }
    };
};
