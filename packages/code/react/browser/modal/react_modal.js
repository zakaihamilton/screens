screens.react.Modal = ({ open }) => {
    const { Element } = screens.react;
    const [isOpen, setOpen] = open;
    const modalClassName = {
        "react-menu-modal": true,
        show: isOpen
    };
    return (<Element className={modalClassName} onClick={() => setOpen(false)} />);
};
