screens.react.List = ({ children, style, horizontal, item, itemSize }) => {
    const { Item, Element, util } = screens.react;
    const [position, setPosition] = React.useState(0);
    const counter = util.useResize();
    const [ref, width, height] = util.useSize(counter);
    const className = {
        "react-list-container": true,
        "horizontal": horizontal,
        "vertical": !horizontal
    };
    const onScroll = () => {
        if (horizontal) {
            setPosition(ref.current.scrollLeft);
        }
        else {
            setPosition(ref.current.scrollTop);
        }
    };
    let offset = 0;
    const size = horizontal ? width : height;
    count = React.Children.count(children);
    children = React.Children.map(children, (el, idx) => {
        let element = null;
        const itemWidth = horizontal ? itemSize : width;
        const itemHeight = horizontal ? height : itemSize;
        if (!idx || idx === count - 1 || (offset > position - (itemSize * 2) && offset < position + size + (itemSize * 2))) {
            element = React.cloneElement(el, { offset, horizontal, width: itemWidth, height: itemHeight, itemSize });
        }
        offset += itemSize;
        return element;
    }).filter(Boolean);
    item = item || screens.react.List.Item;
    return (
        <Element ref={ref} className={className} style={style} onScroll={onScroll}>
            <Item.Component.Provider value={item}>
                {children}
            </Item.Component.Provider>
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
