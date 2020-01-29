/*
 @author Zakai Hamilton
 @component UISession
 */

screens.ui.session = function UISession(me, { core }) {
    me.visibilityState = function () {
        return document.visibilityState;
    };
    me.visibilityChange = {
        set: function (object, value) {
            core.event.register(null, object, "visibilitychange", value, "visibilitychange", document);
        }
    };
};
