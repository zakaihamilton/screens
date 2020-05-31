screens.react.Element = React.forwardRef(({ tag = "div", children, title, direction, className, style, ...props }, ref) => {
    const { Direction, Language } = screens.react;
    const currentLanguage = React.useContext(Language.Context);
    const currentDirection = React.useContext(Direction.Context);
    const nightMode = screens.ui.theme.options.nightMode;
    if (!direction) {
        direction = currentDirection;
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
    if (nightMode) {
        className += " night-mode";
    }
    if (direction === "auto") {
        props.dir = direction;
    }
    if (title && typeof title === "object") {
        title = title[currentLanguage];
    }
    const Component = tag;
    return (<Component ref={ref} title={title} style={style} {...props} className={className}>{children}</Component>);
});
