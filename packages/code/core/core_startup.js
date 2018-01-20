/*
 @author Zakai Hamilton
 @component CoreStartup
 */

package.core.startup = function CoreStartup(me) {
    me.run = function(callback) {
        me.lock((task) => {
            var startup = me["startup"];
            if(startup) {
                var components = startup.components;
                if(components) {
                    components.map(function (component_name) {
                        me.lock(task, (task) => {
                            var component = me.path(component_name);
                            if(component.run) {
                                me.core.console.log("startup:" + component_name);
                                component.run(task);
                            }
                            me.unlock(task);
                        });
                    });
                }
            }
            me.unlock(task, callback);
        });
    };
};
