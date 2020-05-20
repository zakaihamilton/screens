screens.react.Path = ({ state, children }) => {
    const { Item, Element } = screens.react;
    const ref = React.useRef(null);
    const counter = screens.react.util.useResize();
    const count = React.Children.count(children);
    children = React.Children.map(children, (child, index) => {
        return React.cloneElement(child, { ...child, index, count, ...typeof child.props.state === "undefined" && { state } });
    });

    return (<Element className="react-path">
        <Element ref={ref} className="react-path-items">
            <Item.Component.Provider value={screens.react.Path.Item}>
                {children}
            </Item.Component.Provider>
        </Element>
    </Element>);
};

screens.react.Path.Item = ({ id, state, index, count, style, children }) => {
    const { Element } = screens.react;
    const [path, setPath] = state || [];
    const isLast = index === count - 1;
    const onClick = () => {
        if (!isLast) {
            setPath && setPath(path.slice(0, index));
        }
    };
    const className = {
        "react-path-item": true,
        "react-path-select": !isLast
    };
    return (
        <>
            <Element data-id={id} className={className} style={style} onClick={onClick}>
                {children}
            </Element>
            {!isLast && <Element className="react-path-separator">/</Element>}
        </>
    );
};