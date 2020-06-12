screens.react.Input = React.forwardRef(function Input({ state, onSubmit, focus, selectionRange, ...props }, ref) {
    const { Element, util } = screens.react;
    ref = util.useRef(ref);
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
        if (!ref.current) {
            return;
        }
        if (focus) {
            ref.current.focus();
        }
    }, [focus]);

    React.useEffect(() => {
        if (!ref.current) {
            return;
        }
        if (selectionRange) {
            ref.current.setSelectionRange(...selectionRange);
            // eslint-disable-next-line no-console
            console.log("setSelectionRange", selectionRange);
        }
    }, [selectionRange]);

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
