screens.react.Swimlane = ({ label, children }) => {
    const { Element, Item } = screens.react;

    return (
        <Element className="react-swimlane-container">
            <Element className="react-swimlane-label">
                {label}
            </Element>
            <Element className="react-swimlane-children">
                <Item.Component.Provider value={screens.react.Swimlane.Item}>
                    {children}
                </Item.Component.Provider>
            </Element>
        </Element>
    );
};

screens.react.Swimlane.Item = ({ image, children, overlay, ...props }) => {
    const { Element } = screens.react;
    const [isLoading, setLoading] = React.useState(true);
    const [isImageVisible, setImageVisibile] = React.useState(true);
    const onLoad = () => {
        setLoading(false);
    };
    const onError = () => {
        setLoading(false);
        setImageVisibile(false);
    };
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