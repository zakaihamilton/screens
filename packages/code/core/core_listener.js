/*
 @author Zakai Hamilton
 @component CoreListener
 */

screens.core.listener = function CoreListener(me) {
    me.listener = {};
    me.register = function (callback, id) {
        var listener = me.listener[id];
        if (!listener) {
            listener = me.listener[id] = { callbacks: [], signal: false };
        }
        listener.callbacks.push(callback);
    };
    me.reset = function (id) {
        var listener = me.listener[id];
        if (!listener) {
            listener = me.listener[id] = { callbacks: [], signal: false };
        }
        listener.signal = false;
    };
    me.signal = async function (id) {
        var listener = me.listener[id];
        if (!listener) {
            listener = me.listener[id] = { callbacks: [], signal: false };
        }
        listener.signal = true;
        for (var callbackItem of listener.callbacks) {
            await callbackItem(id);
        }
    };
    me.wait = async function (id) {
        var listener = me.listener[id];
        if (!listener) {
            listener = me.listener[id] = { callbacks: [], signal: false };
        }
        if (!listener.signal) {
            return new Promise(resolve => me.register(resolve, id));
        }
    };
};
