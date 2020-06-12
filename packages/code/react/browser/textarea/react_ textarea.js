screens.react.TextArea = React.forwardRef(function TextArea({ className, state, focus, ...props }, ref) {
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

    React.useEffect(() => {
        setCurrentText(text);
    }, [text]);

    React.useEffect(() => {
        if (focus) {
            ref.current.focus();
        }
    }, [focus, ref.current]);

    return (<Element
        ref={ref}
        tag="textarea"
        direction="auto"
        value={currentText}
        onChange={onChange}
        className={"react-textarea-edit " + (className || "")}
        {...props} />);
});
