screens.react.List = ({ children, style, horizontal, item, itemSize }) => {
    const { Item, Element, Direction, util } = screens.react;
    const [position, setPosition] = React.useState(0);
    const direction = React.useContext(Direction.Context);
    const counter = util.useResize();
    const [ref, width, height] = util.useSize(counter);
    const className = {
        "react-list-container": true,
        "horizontal": horizontal,
        "vertical": !horizontal
    };
    let count = React.Children.count(children);
    const length = itemSize * count;
    const onScroll = () => {
        if (horizontal) {
            if (direction === "rtl") {
                setPosition(ref.current.scrollWidth - ref.current.scrollLeft - width);
            }
            else {
                setPosition(ref.current.scrollLeft);
            }
        }
        else {
            setPosition(ref.current.scrollTop);
        }
    };
    React.useEffect(() => {
        onScroll();
    }, [ref && ref.current, direction]);
    let offset = 0;
    const size = horizontal ? width : height;
    children = React.Children.map(children, el => {
        let element = null;
        const itemWidth = horizontal ? itemSize : width;
        const itemHeight = horizontal ? height : itemSize;
        let visible = offset > position - itemSize && offset < position + size + itemSize;
        if (visible) {
            element = React.cloneElement(el, { offset, horizontal, width: itemWidth, height: itemHeight, itemSize, style });
        }
        offset += itemSize;
        return element;
    }).filter(Boolean);
    item = item || screens.react.List.Item;
    let startStyles = null, endStyles = null;
    if (horizontal) {
        if (direction === "rtl") {
            startStyles = { right: 0 };
            endStyles = { right: length };
        }
        else {
            startStyles = { left: 0 };
            endStyles = { left: length };
        }
    }
    else {
        startStyles = { top: 0 };
        endStyles = { top: length };
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

screens.react.List.Item = ({ id, horizontal, offset, width, height, style = {}, children }) => {
    const { Element } = screens.react;
    const ref = React.useRef(null);
    const className = {
        "react-list-item": true
    };
    style = { ...style };
    if (typeof offset !== "undefined") {
        if (horizontal) {
            style.left = offset + "px";
        }
        else {
            style.top = offset + "px";
        }
    }
    if (typeof height !== "undefined") {
        style.height = height + "px";
    }
    if (typeof width !== "undefined") {
        style.width = width + "px";
    }
    return (
        <Element ref={ref} data-id={id} className={className} style={style}>
            {children}
        </Element>
    );
};
