screens.react.Spinner = function Spinner({ children, delay, ...props }) {
    const { Element, util } = screens.react;
    const [startTimer] = util.useTimeout(delay);
    const [isVisible, setVisible] = React.useState(false);
    const className = {
        "react-spinner-loader": true,
        show: isVisible
    };
    React.useEffect(() => {
        startTimer(() => {
            setVisible(true);
        });
    }, []);
    return <Element className={className} {...props}>
        <Element className="react-spinner-text">
            {children}
        </Element>
        <Element className="react-spinner-spinner" direction="ltr" />
    </Element>;
};
