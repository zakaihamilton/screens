screens.react.Direction = ({ children, direction }) => {
    const { Context } = screens.react.Direction;
    return <Context.Provider value={direction}>
        {children}
    </Context.Provider>
};

screens.react.Direction.Context = React.createContext("");