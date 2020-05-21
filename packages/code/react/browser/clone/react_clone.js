screens.react.Clone = ({ children, ...props }) => {
    if (children) {
        children = React.Children.map(children, child => {
            return child && React.cloneElement(child, { ...props });
        }).filter(Boolean);
    }
    return (
        children
    );
};
