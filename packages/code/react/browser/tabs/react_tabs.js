screens.react.Tabs = ({ state, children }) => {
    const { Item } = screens.react;
    const childrenRef = React.useRef(null);
    const indicatorRef = React.useRef(null);
    const counter = screens.react.util.useResize();
    const [selectedId] = state || [];
    children = React.Children.map(children, (child => {
        return React.cloneElement(child, { state });
    }));

    const updateIndicator = (animate) => {
        const items = Array.from((childrenRef.current && childrenRef.current.children) || []);
        const selected = items.find(el => el.dataset.id === selectedId);
        const first = items[0];
        const last = items.length && items[items.length - 1];
        const indicator = indicatorRef.current;
        let left = 0, width = 0, fullWidth = 0;
        if (first && last && selected) {
            left = selected.offsetLeft - first.offsetLeft;
            width = selected.offsetWidth;
            fullWidth = (last.offsetLeft + last.offsetWidth) - first.offsetLeft;
        }
        indicator.style.transition = animate ? "" : "none";
        indicator.children[0].style.marginLeft = left + "px";
        indicator.children[0].style.width = width + "px";
        indicator.style.width = fullWidth + "px";
    };

    React.useEffect(() => {
        updateIndicator(true);
    }, [selectedId]);

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
    const [selectedId, setSelectedId] = state || [];
    const onClick = () => {
        setSelectedId && setSelectedId(id);
    };
    const selected = selectedId === id;
    const className = { "react-tabs-item": true, selected };
    return (
        <div data-id={id} className={className} onClick={onClick}>
            {children}
        </div>
    );
};
