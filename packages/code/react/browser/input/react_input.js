screens.react.Input = React.forwardRef(({ state, onSubmit, ...props }, ref) => {
    const { Element, util } = screens.react;
    const [text, setText] = state;
    const [currentText, setCurrentText] = React.useState(text);
    const [startTimer, stopTimer, hasTimer] = util.useTimer(250);

    const onChange = event => {
        const { value } = event.target;
        startTimer(() => {
            setText(value);
        });
        setCurrentText(value);
    };

    const keyPressed = event => {
        if (onSubmit && event.key === "Enter") {
            setText(currentText);
            onSubmit(currentText);
        }
    };

    React.useEffect(() => {
        return () => {
            stopTimer();
        }
    }, []);

    const value = hasTimer() ? currentText : text;
    return (<Element
        ref={ref}
        tag="input"
        direction="auto"
        value={value}
        onKeyPress={keyPressed}
        onChange={onChange}
        className="react-input-edit"
        {...props} />);
});
