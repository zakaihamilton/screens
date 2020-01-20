screens.react.Element = React.forwardRef(({ tag = "div", children, direction, ...props }, ref) => {
    const { Direction } = screens.react;
    const contextDirection = React.useContext(Direction.Context);
    if (!direction) {
        direction = contextDirection;
    }
    props = props || {};
    let className = props.className || "";
    if (typeof className === "object") {
        if (Array.isArray(className)) {
            className = className.join(" ");
        }
        else {
            className = Object.keys(className).filter(name => className[name]).join(" ");
        }
    }
    if (direction) {
        className += " " + direction;
    }
    const Component = tag;
    return (<Component ref={ref} {...props} className={className}>{children}</Component>);
});
