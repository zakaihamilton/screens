screens.react.Item = function Item(props) {
    const Component = React.useContext(screens.react.Item.Component);
    if (!Component) {
        throw "No parent component defined as Item.Component context";
    }
    return (<Component {...props} />);
};

screens.react.Item.Component = React.createContext(null);
