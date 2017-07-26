/*
    @author Zakai Hamilton
    @component CoreHandle
*/

package.core.handle = function CoreHandle(me) {
    me.init = function() {
        me.handles = {};
    };
    me.lookup = function(ref) {
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
        var ref = me.core.ref.gen();
        me.handles[ref] = object;
        return ref;
    };
};
