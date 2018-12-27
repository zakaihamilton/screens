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
            var components = Object.keys(startup);
            if (components) {
                for (let component_name of components) {
                    var component = screens.browse("startup." + component_name);
                    if (component.run) {
                        me.log("startup: " + component_name);
                        await component.run();
                    }
                }
            }
        }
    };
};
