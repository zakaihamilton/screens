/*
 @author Zakai Hamilton
 @component ReactUtil
 */

screens.react.util = function ReactResize(me, { core, ui }) {
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
};
