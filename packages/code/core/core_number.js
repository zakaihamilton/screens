/*
 @author Zakai Hamilton
 @component CoreNumber
 */

screens.core.number = function CoreNumber(me, { core }) {
    me.fillArray = function (object, range) {
        var result = [];
        range = range.split("-");
        if (range.length > 1) {
            var start = range[0];
            var end = range[1];
            if (end.startsWith("@")) {
                end = core.property.get(object, end.substring(1));
            }
            for (var index = start; index <= end; index++) {
                result.push([index]);
            }
        }
        return result;
    };
};
