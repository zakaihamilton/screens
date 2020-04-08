screens.react.DropDown = ({ state, children, multiple }) => {
    const { Item, Element, Direction } = screens.react;
    const direction = React.useContext(Direction.Context);
    const popupRef = React.useRef(null);
    const selectedRef = React.useRef(null);
    const open = React.useState(0);
    const [selected] = state;
    const [isOpen, setOpen] = open;
    const selectedRect = screens.react.util.getRect(selectedRef.current && selectedRef.current.querySelectorAll("[data-id]")[0], true);
    const counter = screens.react.util.useResize();
    children = React.Children.map(children, (child => {
        return React.cloneElement(child, { ...child && typeof child.props.state === "undefined" && { state }, open });
    }));

    const updatePosition = () => {
        const element = popupRef.current;
        if (element && selectedRect) {
            if (direction === "rtl") {
                popupRef.current.style.left = "";
                popupRef.current.style.right = parseInt(selectedRect.right) + "px";
            }
            else {
                popupRef.current.style.left = parseInt(selectedRect.left) + "px";
                popupRef.current.style.right = "";
            }
            popupRef.current.style.top = parseInt(selectedRect.bottom) + "px";
        }
    };

    const togglePopup = () => {
        setOpen(!isOpen);
    };

    React.useEffect(() => {
        updatePosition();
    }, [counter, isOpen, direction]);

    updatePosition();

    const popupClassName = {
        "react-dropdown-popup": true,
        show: isOpen
    };

    const modalClassName = {
        "react-dropdown-modal": true,
        show: isOpen
    };

    let currentChildren = null;
    if (multiple && selected.length > 1) {
        currentChildren = React.Children.map(multiple, (child => {
            return React.cloneElement(child, { state, open, current: true });
        }));
    }
    else {
        currentChildren = React.Children.map(children, (child => {
            return React.cloneElement(child, { current: true });
        }));
    }

    const popupChildren = React.Children.map(children, (child => {
        return React.cloneElement(child, { ...child && typeof child.props.popup === "undefined" && { popup: true } });
    }));

    return (<Element className="react-dropdown">
        <Element ref={selectedRef} className="react-dropdown-current" onClick={togglePopup}>
            <Item.Component.Provider value={screens.react.DropDown.Item}>
                {currentChildren}
            </Item.Component.Provider>
        </Element>
        <Element className={modalClassName} onClick={() => setOpen(false)} />
        <Element ref={popupRef} className={popupClassName}>
            <Element className="react-dropdown-items">
                <Item.Component.Provider value={screens.react.DropDown.Item}>
                    {popupChildren}
                </Item.Component.Provider>
            </Element>
        </Element>
    </Element>);
};

screens.react.DropDown.Item = ({ id, state, open, current, hideCurrent, hideInList, popup, multiple = true, style, children }) => {
    const { Element } = screens.react;
    const [isOpen, setOpen] = open;
    const [selected, setSelected, subscription] = state || [];
    const isMultiple = Array.isArray(selected);
    let index = -1;
    if (isMultiple) {
        index = selected.findIndex(el => el === id);
    }
    else {
        index = (selected === id) ? 0 : -1;
    }
    subscription.subscribe(selected => {
        if (isMultiple && !multiple && popup) {
            index = selected.findIndex(el => el === id);
            if (index !== -1 && (selected.length > 1 || selected[0] !== id)) {
                selected.splice(index, 1);
                return selected;
            }
            else if (selected.length === 0) {
                return [id];
            }
        }
    });
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
        multiple: isMultiple && multiple
    };
    if (current && index === -1) {
        return null;
    }
    if (current && hideCurrent) {
        return null;
    }
    if (!current && hideInList) {
        return null;
    }
    return (
        <Element data-id={id} className={className} style={style} onClick={onClick}>
            {children}
        </Element>
    );
};
