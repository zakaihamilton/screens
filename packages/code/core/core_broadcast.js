/*
 @author Zakai Hamilton
 @component CoreBroadcast
 */

screens.core.broadcast = function CoreBroadcast(me, { core }) {
    me.registered = [];
    me.register = function (component, mapping) {
        me.registered.push({ component, mapping });
    };
    me.send = async function (method, ...params) {
        var components = me.registered;
        var results = [];
        for (let component of components) {
            const value = component.mapping[method];
            if (value) {
                results.push(core.message.send(value, ...params));
            }
        }
        results = await Promise.all(results);
        return results;
    };
};