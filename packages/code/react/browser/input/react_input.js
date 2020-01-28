screens.react.Input = ({ state, ...props }) => {
    const { Element } = screens.react;
    const [text, setText] = state;

    const onChange = event => {
        setText(event.target.value);
    };

    return (<Element tag="input" direction="auto" value={text} onChange={onChange} className="react-input-edit" {...props} />);
};
