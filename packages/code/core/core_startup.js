/*
 @author Zakai Hamilton
 @component CoreStartup
 */

screens.core.startup = function CoreStartup(me) {
    me.app = {
        name: "",
        params: null
    };
    me.run = async function () {
        var startup = screens["startup"];
        if (startup) {
            var components = Object.values(startup);
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
        }
    };
};
