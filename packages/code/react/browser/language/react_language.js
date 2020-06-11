screens.react.Language = function Language({ children, language }) {
    const { Context } = screens.react.Language;
    return <Context.Provider value={language}>
        {children}
    </Context.Provider>;
};

screens.react.Language.Context = React.createContext("");