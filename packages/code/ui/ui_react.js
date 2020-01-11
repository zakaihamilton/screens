/*
 @author Zakai Hamilton
 @component UIRect
 */

screens.ui.react = function UIProperty(me, { core }) {
    me.render = async function (object, method) {
        const component = await core.property.get(object, method);
        ReactDOM.render(component, object);
    };
};
