/*
 @author Zakai Hamilton
 @component CoreStartup
 */

screens.core.startup = function CoreStartup(me) {
    me.app = {
        name: "",
        params: null
    };
    me.registered = [];
    me.register = function (component) {
        me.registered.push(component);
    };
    me.run = async function () {
        var components = me.registered;
        for (let component of components) {
            if (component.prepare) {
                await component.prepare();
            }
        }
        for (let component of components) {
            if (component.run) {
                await component.run();
            }
        }
    };
};
