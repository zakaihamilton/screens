screens.react.List = ({ children, style, horizontal, item, itemSize, unit = "px" }) => {
    const { pixelsToUnit } = screens.ui.basic;
    const { Item, Element, Direction, util } = screens.react;
    const [position, setPosition] = React.useState(0);
    const direction = React.useContext(Direction.Context);
    const counter = util.useResize();
    const [ref, width, height] = util.useSize(counter);
    const [startTimer, stopTimer, hasTimer] = util.useTimer(0);
    const futurePos = React.useRef(0);
    const className = {
        "react-list-container": true,
        "horizontal": horizontal,
        "vertical": !horizontal
    };
    let count = React.Children.count(children);
    const length = pixelsToUnit(ref.current, itemSize * count);
    const onScroll = () => {
        let position = 0;
        if (horizontal) {
            if (direction === "rtl") {
                position = ref.current.scrollWidth - ref.current.scrollLeft - width;
            }
            else {
                position = ref.current.scrollLeft;
            }
        }
        else {
            position = ref.current.scrollTop;
        }
        futurePos.current = pixelsToUnit(ref.current, position, unit);
        if (hasTimer()) {
            return;
        }
        startTimer(() => {
            setPosition(futurePos.current);
        });
    };
    React.useEffect(() => {
        onScroll();
    }, [ref && ref.current, direction, counter]);
    let offset = 0, size = 0;
    if (horizontal) {
        size = pixelsToUnit(ref.current, width, unit);
    }
    else {
        size = pixelsToUnit(ref.current, height, unit);
    }
    if (ref && ref.current) {
        children = React.Children.map(children, el => {
            let element = null;
            const itemWidth = horizontal ? itemSize : pixelsToUnit(ref.current, width, unit);
            const itemHeight = horizontal ? pixelsToUnit(ref.current, height, unit) : itemSize;
            const itemsToShowSize = 2 * itemSize;
            let visible = offset > position - itemsToShowSize && offset < position + size + itemsToShowSize;
            if (visible) {
                element = React.cloneElement(el, { offset, horizontal, width: itemWidth, height: itemHeight, itemSize, style, unit });
            }
            offset += itemSize;
            return element;
        }).filter(Boolean);
    }
    else {
        children = [];
    }
    item = item || screens.react.List.Item;
    let startStyles = null, endStyles = null;
    if (horizontal) {
        if (direction === "rtl") {
            startStyles = { right: "0" + unit };
            endStyles = { right: length + unit };
        }
        else {
            startStyles = { left: "0" + unit };
            endStyles = { left: length + unit };
        }
    }
    else {
        startStyles = { top: "0" + unit };
        endStyles = { top: length + unit };
    }
    return (
        <Element ref={ref} className={className} style={style} onScroll={onScroll}>
            <Element className="react-list-position" style={startStyles} />
            <Item.Component.Provider value={item}>
                {children}
            </Item.Component.Provider>
            <Element className="react-list-position" style={endStyles} />
        </Element>
    );
};

screens.react.List.Item = ({ id, horizontal, offset, width, height, style = {}, children, unit = "px" }) => {
    const { Element } = screens.react;
    const ref = React.useRef(null);
    const className = {
        "react-list-item": true
    };
    style = { ...style };
    if (typeof offset !== "undefined") {
        if (horizontal) {
            style.left = offset + unit;
        }
        else {
            style.top = offset + unit;
        }
    }
    if (typeof height !== "undefined") {
        style.height = height + unit;
    }
    if (typeof width !== "undefined") {
        style.width = width + unit;
    }
    return (
        <Element ref={ref} data-id={id} className={className} style={style}>
            {children}
        </Element>
    );
};
