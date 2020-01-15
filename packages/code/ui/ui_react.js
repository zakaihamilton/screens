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
    me.handleClassName = function ({ className, ...props }) {
        if (className) {
            if (typeof className === "object") {
                if (Array.isArray(className)) {
                    className = className.join(" ");
                }
                else {
                    className = Object.keys(className).filter(name => className[name]).join(" ");
                }
            }
        }
        return { className, ...props };
    }
    me.createElement = function (component, props, ...children) {
        if (props) {
            props = me.handleClassName(props);
        }
        return React.createElement(component, props, ...children);
    };
};
