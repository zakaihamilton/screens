/*
 @author Zakai Hamilton
 @component CoreListener
 */

screens.core.listener = function CoreListener(me) {
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
        if(callback) {
            callback(null, id);
        }
    };
    me.signal = function(callback, id) {
        var listener = me.listener[id];
        if(!listener) {
            listener = me.listener[id] = {callbacks:[], signal:false};
        }
        listener.signal = true;
        for(var callbackItem of listener.callbacks) {
            callbackItem(null, id);
        }
        if(callback) {
            callback(null, id);
        }
    };
    me.wait = function(callback, id) {
        var listener = me.listener[id];
        if(!listener) {
            listener = me.listener[id] = {callbacks:[], signal:false};
        }
        if(listener.signal) {
            callback(null, id);
        }
        else {
            me.register(callback, id);
        }
    };
};
