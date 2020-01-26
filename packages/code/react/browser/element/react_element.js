screens.react.Element = React.forwardRef(({ tag = "div", children, direction, className, style, ...props }, ref) => {
    const { Direction } = screens.react;
    const contextDirection = React.useContext(Direction.Context);
    if (!direction) {
        direction = contextDirection;
    }
    props = props || {};
    className = className || "";
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
    if (direction === "auto") {
        props.dir = direction;
    }
    const Component = tag;
    return (<Component ref={ref} style={style} {...props} className={className}>{children}</Component>);
});
