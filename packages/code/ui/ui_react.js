/*
 @author Zakai Hamilton
 @component UIReact
 */

screens.ui.react = function UIReact(me, { core, react }) {
    me.render = async function (object, method) {
        const component = await core.property.get(object, method);
        const element = react.util.render(object, component);
        ReactDOM.render(element, object);
    };
};
