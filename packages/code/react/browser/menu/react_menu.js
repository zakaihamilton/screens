screens.react.Menu = ({ label, icon, children }) => {
    const { Item, Element, Direction, Modal } = screens.react;
    const direction = React.useContext(Direction.Context);
    const popupRef = React.useRef(null);
    const menuRef = React.useRef(null);
    const open = React.useState(0);
    const [isOpen, setOpen] = open;
    const menuRect = screens.react.util.getRect(menuRef.current, true);
    const counter = screens.react.util.useResize();

    const updatePosition = () => {
        const element = popupRef.current;
        if (element && menuRect) {
            if (direction === "rtl") {
                popupRef.current.style.left = "";
                popupRef.current.style.right = parseInt(menuRect.right) + "px";
            }
            else {
                popupRef.current.style.left = parseInt(menuRect.left) + "px";
                popupRef.current.style.right = "";
            }
            popupRef.current.style.top = parseInt(menuRect.bottom) + "px";
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
        "react-menu-popup": true,
        show: isOpen
    };

    const buttonClassName = {
        "react-menu-button": true,
        open: isOpen
    };

    const iconClassName = {
        "react-menu-icon": true,
        open: isOpen
    };

    const labelClassName = {
        "react-menu-label": true,
        open: isOpen
    };

    const popupChildren = React.Children.map(children, (child => {
        return child && React.cloneElement(child, { open });
    })).filter(Boolean);

    return (<Element className="react-menu">
        <Element ref={menuRef} className={buttonClassName} onClick={togglePopup}>
            <Element className={iconClassName}>{icon}</Element>
            {label && <Element className={labelClassName}>{label}</Element>}
        </Element>
        <Modal open={open} />
        <Element ref={popupRef} className={popupClassName}>
            <Element className="react-menu-items">
                <Item.Component.Provider value={screens.react.Menu.Item}>
                    {popupChildren}
                </Item.Component.Provider>
            </Element>
        </Element>
    </Element>);
};

screens.react.Menu.Item = ({ id = "", children, open, disable, onClick, ...props }) => {
    const { Element } = screens.react;
    const [isOpen, setOpen] = open;
    const className = {
        "react-menu-item": true,
        disable
    };
    const handleClick = async () => {
        let result = false;
        if (disable) {
            return;
        }
        if (onClick) {
            result = await onClick();
        }
        if (!result) {
            setOpen(false);
        }
    };
    return (
        <Element data-id={id} className={className} onClick={handleClick} {...props}>
            {children}
        </Element>
    );
};
