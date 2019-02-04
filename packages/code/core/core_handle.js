/*
    @author Zakai Hamilton
    @component CoreHandle
*/

screens.core.handle = function CoreHandle(me) {
    me.handles = {};
    me.isHandle = function (ref, type = "handle") {
        return me.core.ref.isRef(ref, type);
    };
    me.find = function (ref) {
        var result = null;
        if (ref) {
            result = me.handles[ref];
        }
        return result;
    };
    me.pop = function (ref) {
        var result = null;
        if (ref) {
            result = me.handles[ref];
            if (result) {
                delete me.handles[ref];
            }
        }
        return result;
    };
    me.push = function (object, type = "handle") {
        var ref = null;
        if (object) {
            ref = me.core.ref.gen(type);
            me.handles[ref] = object;
        }
        return ref;
    };
};
