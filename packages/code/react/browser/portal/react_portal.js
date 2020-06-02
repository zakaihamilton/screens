screens.react.Portal = ({ container, children }) => {
    const { util } = screens.react;
    const object = React.useContext(util.Context);
    const el = React.useRef(container || document.createElement('div'));
    const [dynamic] = React.useState(!el.current.parentElement)
    React.useEffect(() => {
        if (dynamic) {
            object.appendChild(el.current);
        }
        return () => {
            if (dynamic && el.current.parentElement) {
                el.current.parentElement.removeChild(el.current);
            }
        }
    }, [])
    return ReactDOM.createPortal(children, el.current);
};