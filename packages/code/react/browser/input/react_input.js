screens.react.Input = ({ state, ...props }) => {
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

    const value = hasTimer() ? currentText : text;
    return (<Element tag="input" direction="auto" value={value} onChange={onChange} className="react-input-edit" {...props} />);
};
