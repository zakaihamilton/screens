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
    const hideLoader = () => {
        setLoading(false);
    };
    return (
        <Element className="react-swimlane-item-container" {...props}>
            <Element className="react-swimlane-item-image-bg">
                {image &&
                    <>
                        {isLoading && <Element className="react-swimlane-item-image-loader" />}
                        <Element tag="img" onLoad={hideLoader} onError={hideLoader} src={image} className="react-swimlane-item-image" style={{ width: "100%" }} />
                    </>}
                {overlay && <Element tag="img" className="react-swimlane-item-overlay" src={overlay} />}
            </Element>
            <Element className="react-swimlane-item-details">
                {children}
            </Element>
        </Element>
    );
};