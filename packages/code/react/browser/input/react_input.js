screens.react.Input = React.forwardRef(({ state, onSubmit, focus, selectionRange, ...props }, ref) => {
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
        if (!combinedRef.current) {
            return;
        }
        if (focus) {
            combinedRef.current.focus();
        }
    }, [focus]);

    React.useEffect(() => {
        if (!combinedRef.current) {
            return;
        }
        if (selectionRange) {
            combinedRef.current.setSelectionRange(...selectionRange);
            console.log("setSelectionRange", selectionRange);
        }
    }, [selectionRange]);

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
