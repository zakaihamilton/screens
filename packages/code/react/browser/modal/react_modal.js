screens.react.Modal = ({ open }) => {
    const { Element, Portal } = screens.react;
    const [isOpen, setOpen] = open;
    const modalClassName = {
        "react-menu-modal": true,
        show: isOpen
    };
    return (
        <Portal>
            <Element className={modalClassName} onClick={() => setOpen(false)} />
        </Portal>
    );
};
