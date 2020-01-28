screens.react.Input = ({ state }) => {
    const { Element } = screens.react;
    const [text, setText] = state;

    const onChange = event => {
        setText(event.target.value);
    };

    return (<Element tag="input" value={text} onChange={onChange} className="react-input-edit" />);
};
