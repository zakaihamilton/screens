screens.react.Text = ({ language, children }) => {
    const { Language } = screens.react;
    const currentLanguage = React.useContext(Language.Context);
    if (currentLanguage !== language) {
        return null;
    }
    return (
        children
    );
};
