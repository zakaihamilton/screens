/*
 @author Zakai Hamilton
 @component CoreRef
 */

screens.core.ref = function CoreRef(me) {
    me.current = 1000;
    me.gen = function(prefix="ref") {
        me.current++;
        return prefix + "_" + me.current;
    };
    me.isRef = function(string, prefix="ref") {
        var result = false;
        if(typeof string === "string") {
            if(string.startsWith(prefix + "_")) {
                result = true; 
            }
        }
        return result;
    };
};
