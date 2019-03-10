/*
 @author Zakai Hamilton
 @component CoreMethod
 */

screens.core.method = function CoreMethod(me, packages) {
    const { core } = packages;
    me.content = {
        name: "Components",
        search: function (text) {
            if (!core.util.info.admin) {
                return;
            }
            var components = screens.components.sort();
            var keys = Object.keys(screens);
            keys.push("upper");
            var list = [];
            components.map(component => {
                let properties = Object.keys(me.browse(component));
                properties = properties.filter(property => !keys.includes(property));
                properties = properties.filter(property => typeof me.browse(component + "." + property) === "function");
                properties = properties.filter(property => (component + "." + property).toLowerCase().includes(text));
                if (!properties.length) {
                    if (!component.toLowerCase().includes(text)) {
                        return;
                    }
                }
                properties = properties.map(property => ({
                    title: property
                }));
                list.push({ title: component, members: properties });
            });
            list = list.filter(Boolean);
            return list;
        }
    };
};
