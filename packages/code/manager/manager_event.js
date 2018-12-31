/*
 @author Zakai Hamilton
 @component ManagerEvent
 */

screens.manager.event = function ManagerEvent(me) {
    me.events = {};
    me.push = function (id, event) {
        var eventList = me.events[id];
        if (!eventList) {
            eventList = me.events[id] = [];
        }
        eventList.push(event);
    };
    me.empty = function (id) {
        me.events[id] = [];
    };
    me.list = function (id) {
        return me.events[id];
    };
    return "server";
};
