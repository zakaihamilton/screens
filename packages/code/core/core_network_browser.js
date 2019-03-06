/*
 @author Zakai Hamilton
 @component CoreNetwork
 */

screens.core.network = function CoreNetwork(me, packages) {
    const { core } = packages;
    me.isOnline = function () {
        return navigator.onLine;
    };
    me.online = {
        set: function (object, value) {
            core.event.register(null, object, "online", value, "online", window);
        }
    };
    me.offline = {
        set: function (object, value) {
            core.event.register(null, object, "offline", value, "offline", window);
        }
    };
    return "browser";
};
