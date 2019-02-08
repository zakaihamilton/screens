/*
 @author Zakai Hamilton
 @component DbEvents
 */

screens.db.events = function DbEvents(me) {
    return "server";
};

screens.db.events.participants = function DbEventsParticipants(me) {
    me.init = () => me.storage.db.extension(me);
    me.options = { capped: true, size: 5242880, max: 5000 };
    return "server";
};
