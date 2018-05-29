/*
 @author Zakai Hamilton
 @component CoreSession
 */

screens.core.session = function CoreSession(me) {
    me.init = function() {
        me.sessions = {};
    };
    me.open = function() {
        var handle = me.core.ref.gen();
        var session = {handle};
        me.sessions[handle] = session;
        return session;
    };
    me.close = function(session) {
        if(session.close) {
            session.close(session);
        }
        delete me.sessions[session.handle];
    };
    me.get = function(handle) {
        var session = me.sessions[handle];
        return session;
    };
    return "server";
};