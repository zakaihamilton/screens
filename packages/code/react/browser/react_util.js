/*
 @author Zakai Hamilton
 @component ReactUtil
 */

screens.react.util = function ReactResize(me, { core, ui }) {
    me.getRect = function (element) {
        const object = React.useContext(me.context);
        if (!object || !element) {
            return null;
        }
        const objectRect = object.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        return {
            left: elementRect.left - objectRect.left,
            top: elementRect.top - objectRect.top,
            right: elementRect.right - objectRect.left,
            bottom: elementRect.bottom - objectRect.top,
            width: elementRect.width,
            height: elementRect.height
        };
    };
    me.useResize = function () {
        const object = React.useContext(me.context);
        const [counter, setCounter] = React.useState(0);
        React.useEffect(() => {
            const handler = () => {
                setCounter(counter => counter + 1);
            };
            window.addEventListener('resize', handler);
            const forwardList = core.property.forwardList(object, "resize");
            forwardList.set(handler, true);
            setCounter(counter + 1);
            return () => {
                window.removeEventListener('resize', handler);
                forwardList.delete(handler);
            };
        }, []);
        return counter;
    };
    me.render = function (object, component) {
        if (!me.context) {
            me.context = React.createContext(null);
        }
        const Context = me.context;
        return (<Context.Provider value={object}>
            {component}
        </Context.Provider>);
    };
    me.withContext = function (component, name, defaultValue = null) {
        if (!component[name]) {
            component[name] = React.createContext(defaultValue);
        }
        return component[name];
    };
};
