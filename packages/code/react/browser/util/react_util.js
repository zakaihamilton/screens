/*
 @author Zakai Hamilton
 @component ReactUtil
 */

screens.react.util = function ReactUtil(me, { core, ui, react }) {
    me.init = function () {
        me.Context = React.createContext(null);
    };
    me.getRect = function (element, withDirection) {
        const direction = React.useContext(react.Direction.Context);
        const object = React.useContext(me.Context);
        if (!object || !element) {
            return null;
        }
        const objectRect = object.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        if (direction === "rtl" && withDirection) {
            return {
                left: objectRect.right - elementRect.left,
                top: elementRect.top - objectRect.top,
                right: objectRect.right - elementRect.right,
                bottom: elementRect.bottom - objectRect.top,
                width: elementRect.width,
                height: elementRect.height
            };
        }
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
        const object = React.useContext(me.Context);
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
        const { Context } = me;
        return (<Context.Provider value={object}>
            {component}
        </Context.Provider>);
    };
};
