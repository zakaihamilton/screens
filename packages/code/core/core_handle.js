/*
    @author Zakai Hamilton
    @component CoreHandle
*/

screens.core.handle = function CoreHandle(me) {
    me.init = function() {
        me.handles = {};
    };
    me.find = function(ref) {
        var result = null;
        if(ref) {
            result = me.handles[ref];
        }
        return result;
    };
    me.pop = function(ref) {
        var result = null;
        if(ref) {
            result = me.handles[ref];
            delete me.handles[ref];
        }
        return result;
    };
    me.push = function(object) {
        var ref = null;
        if(object) {
            var ref = me.core.ref.gen();
            me.handles[ref] = object;
        }
        return ref;
    };
};
