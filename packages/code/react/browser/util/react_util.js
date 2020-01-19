/*
 @author Zakai Hamilton
 @component ReactUtil
 */

screens.react.util = function ReactUtil(me, { core, ui, react }) {
    me.init = function () {
        me.Context = React.createContext(null);
    };
    me.useState = function (value) {
        const [getter, setter] = React.useState(value);
        const subscriptions = React.useRef([]);
        const subscribe = (handler) => {
            subscriptions.current.push(handler);
        };
        const unsubscribe = (handler) => {
            const index = subscriptions.current.findIndex(callback => callback === handler);
            if (index !== -1) {
                subscriptions.current.splice(index, 1);
            }
        };
        const update = (value) => {
            for (const subscription of subscriptions.current) {
                const result = subscription(value);
                if (typeof result !== "undefined") {
                    value = result;
                }
            }
            setter(value);
        };
        return [getter, update, {
            subscribe,
            unsubscribe
        }];
    };
    me.useSubscribe = function (state) {
        const [getter, setter, subscription] = state;
        const [counter, setCounter] = React.useState(0);
        React.useEffect(() => {
            const handler = () => {
                setCounter(counter => {
                    return counter + 1;
                });
            };
            subscription.subscribe(handler);
            return () => {
                subscription.unsubscribe(handler);
            };
        });
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
