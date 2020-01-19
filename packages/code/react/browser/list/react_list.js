screens.react.List = ({ children }) => {
    const { Item, Element } = screens.react;
    return (
        <Element>
            <Item.Component.Provider value={screens.react.List.Item}>
                {children}
            </Item.Component.Provider>
        </Element>
    );
};

screens.react.List.Item = ({ id, style, children }) => {
    const { Element } = screens.react;
    const className = {
        "react-list-item": true
    };
    return (
        <Element data-id={id} className={className} style={style}>
            {children}
        </Element>
    );
};
