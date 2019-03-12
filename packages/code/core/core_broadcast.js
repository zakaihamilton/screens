/*
 @author Zakai Hamilton
 @component CoreBroadcast
 */

screens.core.broadcast = function CoreBroadcast(me, packages) {
    const { core } = packages;
    me.registered = [];
    me.register = function (component, mapping) {
        me.registered.push({ component, mapping });
    };
    me.send = async function (method) {
        var args = Array.prototype.slice.call(arguments, 0);
        var components = me.registered;
        for (let component of components) {
            args[0] = component.mapping[method];
            if (args[0]) {
                await core.message.send.apply(null, args);
            }
        }
    };
};