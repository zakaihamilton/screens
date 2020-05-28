screens.react.TextArea = React.forwardRef(({ state, focus, ...props }, ref) => {
    const { Element, util } = screens.react;
    const inputRef = React.useRef(null);
    const combinedRef = util.useRefs(ref, inputRef);
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
        tag="textarea"
        direction="auto"
        value={currentText}
        onChange={onChange}
        className="react-textarea-edit"
        {...props} />);
});
