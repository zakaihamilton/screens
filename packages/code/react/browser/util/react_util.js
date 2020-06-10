/*
 @author Zakai Hamilton
 @component ReactUtil
 */

screens.react.util = function ReactUtil(me, { core, react }) {
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
            window.addEventListener("resize", handler);
            const forwardList = core.property.forwardList(object, "resize");
            forwardList.set(handler, true);
            setCounter(counter + 1);
            return () => {
                window.removeEventListener("resize", handler);
                forwardList.delete(handler);
            };
        }, []);
        return counter;
    };
    me.useRefs = function (...refs) {
        const targetRef = React.useRef();

        React.useEffect(() => {
            refs.forEach(ref => {
                if (!ref) return;

                if (typeof ref === "function") {
                    ref(targetRef.current);
                } else {
                    ref.current = targetRef.current;
                }
            });
        }, [refs]);

        return targetRef;
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
    me.useTimeout = function (timeout = 0) {
        const timeoutRef = React.useRef();
        const stop = React.useCallback(() => {
            const timeoutId = timeoutRef.current;
            if (timeoutId) {
                timeoutRef.current = undefined;
                clearTimeout(timeoutId);
            }
        });
        const start = React.useCallback(callback => {
            stop();
            timeoutRef.current = setTimeout(() => {
                timeoutRef.current = undefined;
                callback();
            }, timeout);
        });
        const exists = React.useCallback(() => {
            return timeoutRef.current;
        });
        React.useEffect(() => {
            return () => {
                stop();
            };
        }, []);
        return [start, stop, exists];
    };
    me.useInterval = function (interval) {
        const intervalRef = React.useRef();
        const stop = React.useCallback(() => {
            const intervalId = intervalRef.current;
            if (intervalId) {
                intervalRef.current = undefined;
                clearInterval(intervalId);
            }
        });
        const start = React.useCallback(callback => {
            stop();
            intervalRef.current = setInterval(() => {
                if (!intervalRef.current) {
                    return;
                }
                callback();
            }, interval);
        });
        const exists = React.useCallback(() => {
            return intervalRef.current;
        });
        React.useEffect(() => {
            return () => {
                stop();
            };
        }, []);
        return [start, stop, exists];
    };
    me.render = function Render(object, component) {
        const { Context } = me;
        return (<Context.Provider value={object}>
            {component}
        </Context.Provider>);
    };
    me.useObject = function () {
        return React.useContext(me.Context);
    };
    me.useHover = function () {
        const [value, setValue] = React.useState(false);
        const ref = React.useRef(null);

        const handleMouseOver = () => setValue(true);
        const handleMouseOut = () => setValue(false);

        React.useEffect(() => {
            const node = ref.current;
            if (node) {
                node.addEventListener("mouseover", handleMouseOver);
                node.addEventListener("mouseout", handleMouseOut);

                return () => {
                    node.removeEventListener("mouseover", handleMouseOver);
                    node.removeEventListener("mouseout", handleMouseOut);
                };
            }
        }, [ref.current]);

        return [ref, value];
    };
};
