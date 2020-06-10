screens.react.Field = function Field({ label, children, ...props }) {
    const { Element } = screens.react;
    return (
        <Element className="react-field-container" {...props}>
            <Element className="react-field-label">{label}</Element>
            <Element className="react-field-children">{children}</Element>
        </Element>
    );
};
