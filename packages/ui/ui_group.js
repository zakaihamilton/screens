/*
 @author Zakai Hamilton
 @component UIGroup
 */

package.ui.group = function UIGroup(me) {
    me.set = function(object, method, value) {
        if (Array.isArray(value)) {
            me.ui.element.create(value, object);
        }
        else if(value) {
            for (var key in value) {
                me.ui.element.set(object, key, value[key]);
            }
        }
        me.core.message.send({component: "ui." + method, method: "group", params: [object]});
    };
};
