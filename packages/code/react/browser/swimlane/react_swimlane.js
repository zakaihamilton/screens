screens.react.Swimlane = ({ label, children }) => {
    const { Element, List, Item } = screens.react;

    return (
        <Element className="react-swimlane-container">
            <Element className="react-swimlane-label">
                {label}
            </Element>
            <Element className="react-swimlane-children">
                <List horizontal={true} itemSize={17} unit="em" item={screens.react.Swimlane.Item}>
                    {children}
                </List>
            </Element>
        </Element>
    );
};

screens.react.Swimlane.Item = ({ image, offset, horizontal, children, itemSize, unit, overlay, ...props }) => {
    const { Element, Direction } = screens.react;
    const [isLoading, setLoading] = React.useState(false);
    const [isImageVisible, setImageVisibile] = React.useState(false);
    const direction = React.useContext(Direction.Context);
    const onLoad = () => {
        setLoading(false);
    };
    const onError = () => {
        setLoading(false);
        setImageVisibile(false);
    };
    React.useEffect(() => {
        const timerHandle = setTimeout(() => {
            setLoading(true);
            setImageVisibile(true);
        }, 250);
        return (() => {
            clearTimeout(timerHandle);
        })
    }, []);
    props = props || {};
    props.style = props.style || {};
    if (direction === "rtl") {
        props.style.right = offset + unit;
    }
    else {
        props.style.left = offset + unit;
    }
    return (
        <Element className="react-swimlane-item-container" {...props}>
            <Element className="react-swimlane-item-image-bg">
                {image &&
                    <>
                        {isLoading && <Element className="react-swimlane-item-image-loader" />}
                        {isImageVisible && <Element tag="img" onLoad={onLoad} onError={onError} src={image} className="react-swimlane-item-image" style={{ width: "100%" }} />}
                    </>}
                {overlay && <Element tag="img" className="react-swimlane-item-overlay" src={overlay} />}
            </Element>
            <Element className="react-swimlane-item-details">
                {children}
            </Element>
        </Element>
    );
};