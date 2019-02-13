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
            components = components.map(component => {
                if (!component.toLowerCase().includes(text)) {
                    return null;
                }
                return {
                    title: component
                };
            });
            components = components.filter(Boolean);
            return components;
        }
    };
};
