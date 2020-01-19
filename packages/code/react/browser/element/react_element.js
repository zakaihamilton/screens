screens.react.Element = React.forwardRef(({ tag = "div", children, ...props }, ref) => {
    const { Direction } = screens.react;
    const direction = React.useContext(Direction.Context);
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
