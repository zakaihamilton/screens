/*
 @author Zakai Hamilton
 @component UIReact
 */

screens.ui.react = function UIReact(me, { core, react }) {
    me.init = function () {
        for (const key in react) {
            if (typeof react[key] === "function") {
                react[key].displayName = key;
            }
        }
    };
    me.render = async function (object, method) {
        const component = await core.property.get(object, method);
        const element = react.util.render(object, component);
        // eslint-disable-next-line no-undef
        ReactDOM.render(element, object);
    };
};
