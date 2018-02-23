/*
 @author Zakai Hamilton
 @component CoreListener
 */

package.core.listener = function CoreListener(me) {
    me.listener = {};
    me.register = function(callback, id) {
        var listener = me.listener[id];
        if(!listener) {
            listener = me.listener[id] = {callbacks:[], signal:false};
        }
        listener.callbacks.push(callback);
    };
    me.reset = function(callback, id) {
        var listener = me.listener[id];
        var listener = me.listener[id];
        if(!listener) {
            listener = me.listener[id] = {callbacks:[], signal:false};
        }
        listener.signal = false;
        callback(id);
    };
    me.signal = function(callback, id) {
        var listener = me.listener[id];
        if(!listener) {
            listener = me.listener[id] = {callbacks:[], signal:false};
        }
        listener.signal = true;
        for(var callbackItem of listener.callbacks) {
            callbackItem(id);
        }
        callback(id);
    };
    me.wait = function(callback, id) {
        var listener = me.listener[id];
        if(!listener) {
            listener = me.listener[id] = {callbacks:[], signal:false};
        }
        if(listener.signal) {
            callback(id);
        }
        else {
            me.register(callback, id);
        }
    };
};
