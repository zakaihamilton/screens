screens.react.DropDown = ({ state, children }) => {
    const { Item } = screens.react;
    const popupRef = React.useRef(null);
    const selectedRef = React.useRef(null);
    const open = React.useState(0);
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
            popupRef.current.style.top = parseInt(selectedRect.bottom) + "px";
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
            <div className="react-dropdown-items">
                <Item.Component.Provider value={screens.react.DropDown.Item}>
                    {popupChildren}
                </Item.Component.Provider>
            </div>
        </div>
    </div>);
};

screens.react.DropDown.Item = ({ id, state, open, current, popup, multiple = true, style, children }) => {
    const [selected, setSelected] = state || [];
    const [isOpen, setOpen] = open || [];
    const isMultiple = Array.isArray(selected);
    let index = -1;
    if (isMultiple) {
        index = selected.findIndex(el => el === id);
    }
    else {
        index = (selected === id) ? 0 : -1;
    }
    if (isMultiple && !multiple) {
        if (index !== -1 && (selected.length > 1 || selected[0] !== id)) {
            selected.splice(index, 1);
            setSelected(selected);
            if (isOpen) {
                setOpen(isOpen + 1);
            }
        }
        else if (selected.length === 0) {
            setSelected([id]);
            if (isOpen) {
                setOpen(isOpen + 1);
            }
        }
    }
    const onClick = () => {
        if (current) {
            return;
        }
        if (isMultiple) {
            if (multiple) {
                if (index !== -1) {
                    selected.splice(index, 1);
                }
                else {
                    selected.push(id);
                }
                setSelected && setSelected(selected);
            }
            else {
                setSelected && setSelected([id]);
            }
            setOpen && setOpen(open + 1);
        }
        else {
            setSelected && setSelected(id);
            setOpen && setOpen(0);
        }
    };
    const className = {
        "react-dropdown-item": true,
        selected: index !== -1,
        open: isOpen,
        current,
        popup,
        multiple
    };
    if (current && index === -1) {
        return null;
    }
    return (
        <div data-id={id} className={className} style={style} onClick={onClick}>
            {children}
        </div>
    );
};
