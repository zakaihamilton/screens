/*
 @author Zakai Hamilton
 @component CoreStartup
 */

screens.core.startup = function CoreStartup(me) {
    me.app = {
        name: "",
        params: null
    };
    me.run = function(callback) {
        me.lock((task) => {
            var startup = screens["startup"];
            if(startup) {
                var components = Object.keys(startup);
                if(components) {
                    components.map(function (component_name) {
                        me.lock(task, (task) => {
                            var component = screens("startup." + component_name);
                            if(component.run) {
                                me.log("startup: " + component_name);
                                component.run(task);
                            }
                            me.unlock(task);
                        });
                    });
                }
            }
            me.unlock(task, () => {
                if(callback) {
                    callback();
                }
            });
        });
    };
};
