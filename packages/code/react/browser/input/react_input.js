screens.react.Input = React.forwardRef(({ state, onSubmit, focus, ...props }, ref) => {
    const { Element, util } = screens.react;
    const inputRef = React.useRef(null);
    const combinedRef = util.useRefs(ref, inputRef);
    const [text, setText] = state;
    const [currentText, setCurrentText] = React.useState(text);
    const [startTimer] = util.useTimeout(250);

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

    React.useEffect(() => {
        if (focus) {
            combinedRef.current.focus();
        }
    }, [focus, combinedRef.current]);

    return (<Element
        ref={combinedRef}
        tag="input"
        direction="auto"
        value={currentText}
        onKeyPress={keyPressed}
        onChange={onChange}
        className="react-input-edit"
        {...props} />);
});
