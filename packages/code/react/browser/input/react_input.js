screens.react.Input = React.forwardRef(({ state, onSubmit, ...props }, ref) => {
    const { Element, util } = screens.react;
    const [text, setText] = state;
    const [currentText, setCurrentText] = React.useState(text);
    const [startTimer] = util.useTimer(250);

    const onChange = event => {
        const { value } = event.target;
        setCurrentText(value);
        startTimer(() => {
            setText(value);
        });
    };

    const keyPressed = event => {
        if (onSubmit && event.key === "Enter") {
            setText(currentText);
            onSubmit(currentText);
        }
    };

    React.useEffect(() => {
        setCurrentText(text);
    }, [text]);

    return (<Element
        ref={ref}
        tag="input"
        direction="auto"
        value={currentText}
        onKeyPress={keyPressed}
        onChange={onChange}
        className="react-input-edit"
        {...props} />);
});
