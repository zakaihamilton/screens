/*
 @author Zakai Hamilton
 @component CoreMethod
 */

screens.core.method = function CoreMethod(me) {
    me.content = {
        name: "Components",
        search: function (text) {
            if (!me.core.util.isAdmin) {
                return;
            }
            var components = screens.components.sort();
            var keys = Object.keys(screens);
            var list = [];
            components.map(component => {
                let properties = Object.keys(me.browse(component));
                properties = properties.filter(property => !keys.includes(property));
                properties = properties.map(property => component + "." + property);
                properties = properties.filter(property => property.toLowerCase().includes(text));
                properties = properties.map(property => ({
                    title: property
                }));
                list.push(...properties);
            });
            list = list.filter(Boolean);
            return list;
        }
    };
};
