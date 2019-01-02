/*
 @author Zakai Hamilton
 @component ManagerEvent
 */

screens.manager.event = function ManagerEvent(me) {
    me.events = {};
    me.maxEvents = 5000;
    me.push = function (id, event) {
        var eventList = me.events[id];
        if (!eventList) {
            eventList = me.events[id] = [];
        }
        if (eventList.length > me.maxEvents) {
            eventList.shift();
        }
        eventList.push(event);
    };
    me.empty = function (id) {
        me.events[id] = [];
    };
    me.list = function (id) {
        var list = me.events[id];
        if (!list) {
            return [];
        }
        return list;
    };
    return "server";
};
