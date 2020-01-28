screens.react.Bar = ({ children, ...props }) => {
    const { Element } = screens.react;
    return (
        <Element className="react-bar-container" {...props}>
            {children}
        </Element>
    );
};
