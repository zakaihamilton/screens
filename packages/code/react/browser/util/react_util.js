/*
 @author Zakai Hamilton
 @component ReactUtil
 */

screens.react.util = function ReactUtil(me, { core, react }) {
    me.init = function () {
        me.Context = React.createContext(null);
    };
    me.makeState = function ([getter, setter]) {
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
    me.useState = function (value) {
        const state = React.useState(value);
        return me.makeState(state);
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
    me.useSize = function (counter) {
        const ref = React.useRef();
        const [size, setSize] = React.useState([]);
        const [width, height] = size;
        React.useLayoutEffect(() => {
            if (ref.current) {
                setSize([ref.current.offsetWidth, ref.current.offsetHeight]);
            }
        }, [counter]);
        return [ref, width, height];
    };
    me.useTimer = function (timeout) {
        const [timer, setTimer] = React.useState(null);
        const stopTimer = () => {
            if (timer) {
                clearTimeout(timer);
                setTimer(null);
            }
        };
        const startTimer = callback => {
            stopTimer();
            setTimer(setTimeout(() => {
                setTimer(null);
                callback();
            }, timeout));
        };
        const hasTimer = () => {
            return timer;
        };
        return [startTimer, stopTimer, hasTimer];
    };
    me.render = function (object, component) {
        const { Context } = me;
        return (<Context.Provider value={object}>
            {component}
        </Context.Provider>);
    };
    me.useObject = function () {
        return React.useContext(me.Context);
    };
    me.useData = function (callback, depends = []) {
        const state = React.useRef({ depends: null, value: undefined });
        const change = !state.current.depends || state.current.depends.some((item, idx) => {
            return !core.json.compare(depends[idx], item);
        });
        if (change) {
            const value = callback();
            state.current = { depends: JSON.parse(JSON.stringify(depends)), value };
        }
        return state.current.value;
    };
};
