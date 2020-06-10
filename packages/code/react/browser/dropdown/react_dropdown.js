screens.react.DropDown = function DropDown({ state, children = [], multiple, path }) {
    const { Item, Element, Direction, Modal } = screens.react;
    const direction = React.useContext(Direction.Context);
    const popupRef = React.useRef(null);
    const selectedRef = React.useRef(null);
    const open = React.useState(0);
    const [selected] = state;
    const [isOpen, setOpen] = open;
    const selectedRect = screens.react.util.getRect(selectedRef.current && selectedRef.current.querySelectorAll("[data-id]")[0], true);
    const counter = screens.react.util.useResize();
    children = React.Children.map(children, (child => {
        return child && React.cloneElement(child, { ...child && typeof child.props.state === "undefined" && { state }, open, path });
    })).filter(Boolean);

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

    let currentChildren = null;
    if (multiple && selected.length > 1) {
        currentChildren = React.Children.map(multiple, child => {
            return child && React.cloneElement(child, { state, open, current: true, display: true });
        }).filter(Boolean);
    }
    else {
        currentChildren = React.Children.map(children, child => {
            return child && React.cloneElement(child, { current: true });
        }).filter(Boolean);
    }

    const popupChildren = React.Children.map(children, (child => {
        return child && React.cloneElement(child, { ...child && typeof child.props.popup === "undefined" && { popup: true } });
    })).filter(Boolean);

    return (<Element className="react-dropdown">
        <Element ref={selectedRef} className="react-dropdown-current" onClick={togglePopup}>
            <Item.Component.Provider value={screens.react.DropDown.Item}>
                {currentChildren}
            </Item.Component.Provider>
        </Element>
        <Modal open={open} />
        <Element ref={popupRef} className={popupClassName}>
            <Element className="react-dropdown-items">
                <Item.Component.Provider value={screens.react.DropDown.Item}>
                    {popupChildren}
                </Item.Component.Provider>
            </Element>
        </Element>
    </Element>);
};

screens.react.DropDown.Item = function DropDownItem({ id, state, open, display, current, hideCurrent, hideInList, popup, multiple = true, path, style, children }) {
    const { Element } = screens.react;
    const [isOpen, setOpen] = open;
    const [selected, setSelected] = state || [];
    const isMultiple = Array.isArray(selected);
    let index = -1;
    if (isMultiple) {
        if (path) {
            index = selected.filter(Boolean).length === id ? id : -1;
        }
        else {
            index = selected.findIndex(el => el === id);
        }
    }
    else {
        index = (selected === id) ? 0 : -1;
    }
    React.useEffect(() => {
        if (isMultiple && !multiple && !path && popup) {
            index = selected.findIndex(el => el === id);
            if (index !== -1 && (selected.length > 1 || selected[0] !== id)) {
                const result = [...selected];
                result.splice(index, 1);
                setSelected(result);
                if (isOpen) {
                    setOpen && setOpen(isOpen + 1);
                }
            }
            else if (selected.length === 0) {
                setSelected([id]);
                if (isOpen) {
                    setOpen && setOpen(isOpen + 1);
                }
            }
        }
    });
    const onClick = () => {
        if (current) {
            return;
        }
        if (isMultiple) {
            if (path) {
                setSelected(selected.slice(0, id));
                setOpen && setOpen(0);
            }
            else if (multiple) {
                const result = [...selected];
                if (index !== -1) {
                    result.splice(index, 1);
                }
                else {
                    result.push(id);
                }
                setSelected && setSelected(result);
            }
            else {
                setSelected && setSelected([id]);
            }
            setOpen && setOpen(isOpen + 1);
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
        multiple: isMultiple && multiple && !path
    };
    if (current && index === -1 && !display) {
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
