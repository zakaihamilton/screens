screens.react.Field = ({ label, children }) => {
    const { Element } = screens.react;
    return (
        <Element className="react-field-container">
            <Element className="react-field-label">{label}</Element>
            <Element className="react-field-children">{children}</Element>
        </Element>
    );
};
