/*
 @author Zakai Hamilton
 @component UIRect
 */

screens.ui.react = function UIProperty(me, { core }) {
    me.render = async function (object, method) {
        const component = await core.property.get(object, method);
        ReactDOM.render(component, object);
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
