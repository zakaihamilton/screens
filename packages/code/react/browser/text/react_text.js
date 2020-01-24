screens.react.Text = ({ language, children }) => {
    const { Language } = screens.react;
    const currentLanguage = React.useContext(Language.Context);
    if (typeof language === "function") {
        return language(currentLanguage);
    }
    if (currentLanguage !== language) {
        return null;
    }
    return (
        children
    );
};
