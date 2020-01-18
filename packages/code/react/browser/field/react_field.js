screens.react.Field = ({ label, children }) => {
    return (
        <div className="react-field-container">
            <div className="react-field-label">{label}</div>
            <div className="react-field-children">{children}</div>
        </div>
    );
};