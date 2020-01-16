screens.react.DropDown = ({ state, children }) => {
    const { Item } = screens.react;
    const popupRef = React.useRef(null);
    const selectedRef = React.useRef(null);
    const open = React.useState(false);
    const [isOpen, setOpen] = open;
    const selectedRect = screens.react.util.getRect(selectedRef.current && selectedRef.current.children[0]);
    const counter = screens.react.util.useResize();
    children = React.Children.map(children, (child => {
        return React.cloneElement(child, { state, open });
    }));

    const togglePopup = () => {
        setOpen(!isOpen);
    };

    React.useEffect(() => {
        const element = popupRef.current;
        if (element && selectedRect) {
            popupRef.current.style.left = parseInt(selectedRect.left) + "px";
            popupRef.current.style.top = parseInt(selectedRect.top) + "px";
        }
    }, [counter, selectedRect && selectedRect.left]);

    const popupClassName = {
        "react-dropdown-popup": true,
        show: isOpen
    };

    const modalClassName = {
        "react-dropdown-modal": true,
        show: isOpen
    };

    const currentChildren = React.Children.map(children, (child => {
        return React.cloneElement(child, { current: true });
    }));

    const popupChildren = React.Children.map(children, (child => {
        return React.cloneElement(child, { popup: true });
    }));

    return (<div className="react-dropdown">
        <div ref={selectedRef} className="react-dropdown-current" onClick={togglePopup}>
            <Item.Component.Provider value={screens.react.DropDown.Item}>
                {currentChildren}
            </Item.Component.Provider>
        </div>
        <div className={modalClassName} onClick={() => setOpen(false)} />
        <div ref={popupRef} className={popupClassName}>
            <div className="react-dropdown-current" onClick={togglePopup}>
                <Item.Component.Provider value={screens.react.DropDown.Item}>
                    {currentChildren}
                </Item.Component.Provider>
            </div>
            <div className="react-dropdown-items">
                <Item.Component.Provider value={screens.react.DropDown.Item}>
                    {popupChildren}
                </Item.Component.Provider>
            </div>
        </div>
    </div>);
};

screens.react.DropDown.Item = ({ id, state, open, current, popup, children }) => {
    const [selectedId, setSelectedId] = state || [];
    const [isOpen, setOpen] = open || [];
    const onClick = () => {
        setSelectedId && setSelectedId(id);
        setOpen && setOpen(false);
    };
    const className = {
        "react-dropdown-item": true,
        selected: selectedId === id,
        open: isOpen,
        current,
        popup
    };
    if (current && selectedId !== id) {
        return null;
    }
    return (
        <div data-id={id} className={className} onClick={onClick}>
            {children}
        </div>
    );
};
