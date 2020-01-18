screens.react.Tabs = ({ state, children }) => {
    const { Item } = screens.react;
    const childrenRef = React.useRef(null);
    const indicatorRef = React.useRef(null);
    const counter = screens.react.util.useResize();
    const [selected] = state || [];
    children = React.Children.map(children, (child => {
        return React.cloneElement(child, { state });
    }));

    const updateIndicator = (animate) => {
        const items = Array.from((childrenRef.current && childrenRef.current.children) || []);
        const selectedItem = items.find(el => el.dataset.id === selected);
        const firstItem = items[0];
        const lastItem = items.length && items[items.length - 1];
        const indicator = indicatorRef.current;
        let left = 0, width = 0, fullWidth = 0;
        if (firstItem && lastItem && selectedItem) {
            left = selectedItem.offsetLeft - firstItem.offsetLeft;
            width = selectedItem.offsetWidth;
            fullWidth = (lastItem.offsetLeft + lastItem.offsetWidth) - firstItem.offsetLeft;
        }
        indicator.style.transition = animate ? "" : "none";
        indicator.children[0].style.marginLeft = left + "px";
        indicator.children[0].style.width = width + "px";
        indicator.style.width = fullWidth + "px";
    };

    React.useEffect(() => {
        updateIndicator(true);
    }, [selected]);

    React.useEffect(() => {
        updateIndicator(false);
    }, [counter]);

    return (
        <div className="react-tabs">
            <div ref={childrenRef} className="react-tabs-items">
                <Item.Component.Provider value={screens.react.Tabs.Item}>
                    {children}
                </Item.Component.Provider>
            </div>
            <div className="react-tabs-items">
                <div ref={indicatorRef}>
                    <div className="react-tabs-indicator" />
                </div>
            </div>
        </div >
    );
};

screens.react.Tabs.Item = ({ id, state, children }) => {
    const [selected, setSelected] = state || [];
    const onClick = () => {
        setSelected && setSelected(id);
    };
    const className = { "react-tabs-item": true, selected: selected === id };
    return (
        <div data-id={id} className={className} onClick={onClick}>
            {children}
        </div>
    );
};