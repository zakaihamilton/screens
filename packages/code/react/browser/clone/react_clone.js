screens.react.Clone = ({ children, ...props }) => {
    if (children) {
        children = React.Children.map(children, child => {
            return React.cloneElement(child, { ...props });
        });
    }
    return (
        children
    );
};
